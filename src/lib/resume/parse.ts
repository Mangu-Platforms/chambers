import { uid } from "./ids";
import { emptyResume } from "./sample";
import type { EducationItem, ExperienceItem, Resume } from "./types";
import { normalize } from "./text";

const SECTION =
  /^(summary|profile|objective|experience|work experience|employment|professional experience|education|skills|tools|projects|selected work|additional|certifications|awards)\s*:?$/i;

export function parseResumeText(text: string): Resume {
  const lines = text
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.trim())
    .filter((l, i, arr) => l.length > 0 || (arr[i - 1] && arr[i - 1].length > 0));

  const resume = emptyResume();
  if (!lines.length) return resume;

  const blocks = splitSections(lines);
  const head = blocks.header ?? lines.slice(0, 8);

  resume.identity.name = pickName(head);
  resume.identity.title = pickTitle(head, resume.identity.name);
  resume.identity.email = pick(text, /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  resume.identity.phone = pick(text, /(\+?\d[\d\s().-]{7,}\d)/);
  resume.identity.linkedin = pick(text, /(linkedin\.com\/in\/[^\s,]+)/i);
  resume.identity.website = pick(
    text,
    /\b((?:https?:\/\/)?(?:www\.)?[a-z0-9.-]+\.[a-z]{2,}(?:\/[^\s,]*)?)/i,
    (v) => (v.includes("linkedin") || v.includes("@") ? "" : v),
  );
  resume.identity.location = pickLocation(head);

  const summaryBlock = blocks.summary ?? blocks.profile ?? blocks.objective;
  if (summaryBlock) resume.summary = summaryBlock.filter((l) => !SECTION.test(l)).join(" ").trim();

  const expLines = blocks.experience ?? blocks["work experience"] ?? blocks.employment ?? [];
  resume.experience = parseJobs(expLines);

  resume.education = parseEducation(blocks.education ?? []);
  resume.skills = parseSkills(blocks.skills ?? blocks.tools ?? [], text);

  const extraSrc = blocks.projects ?? blocks.additional ?? blocks["selected work"];
  if (extraSrc?.length) {
    resume.extras = [
      {
        id: uid(),
        label: "Selected work",
        items: extraSrc.filter((l) => !SECTION.test(l)).map((l) => l.replace(/^[-\u2022]\s*/, "")),
      },
    ];
  }

  if (!resume.experience.length) resume.experience = parseJobs(lines.slice(3));
  if (!resume.summary) {
    const prose = lines.find((l) => l.length > 80 && !l.includes("@") && !SECTION.test(l));
    if (prose) resume.summary = prose;
  }
  return resume;
}

function splitSections(lines: string[]): Record<string, string[]> {
  const out: Record<string, string[]> = { header: [] };
  let current = "header";
  for (const line of lines) {
    const key = line.toLowerCase().replace(/:$/, "");
    if (SECTION.test(line)) {
      current = key;
      out[current] = out[current] ?? [];
      continue;
    }
    out[current] = out[current] ?? [];
    out[current].push(line);
  }
  return out;
}

function pickName(head: string[]): string {
  return head.find((l) => l.length > 2 && l.length < 48 && !l.includes("@") && !/\d{3}/.test(l)) ?? "";
}

function pickTitle(head: string[], name: string): string {
  return (
    head.find(
      (l) =>
        l !== name &&
        l.length < 80 &&
        !l.includes("@") &&
        !/linkedin|http/i.test(l) &&
        /design|engineer|product|editor|operator|lead|manager|director|writer|producer/i.test(l),
    ) ??
    head.find((l) => l !== name && l.length < 70 && !l.includes("@") && l.includes("·")) ??
    ""
  );
}

function pickLocation(head: string[]): string {
  return (
    head.find(
      (l) =>
        /remote|york|newark|austin|francisco|boston|london|city|nj|ny|tx|ca/i.test(l) &&
        !l.includes("@") &&
        l.length < 60,
    ) ?? ""
  );
}

function pick(text: string, re: RegExp, filter?: (v: string) => string): string {
  const m = text.match(re);
  if (!m) return "";
  const v = m[1] ?? m[0];
  return filter ? filter(v) : v;
}

function parseJobs(lines: string[]): ExperienceItem[] {
  const jobs: ExperienceItem[] = [];
  let current: ExperienceItem | null = null;
  const dateRe = /(20\d{2}|19\d{2}|present)/i;
  const flush = () => {
    if (current && (current.role || current.org || current.bullets.length)) jobs.push(current);
    current = null;
  };

  for (const raw of lines) {
    const line = raw.replace(/^[-\u2022\u25cf]\s*/, "");
    if (SECTION.test(line)) continue;
    const dated = dateRe.test(line) && line.length < 80;
    const looksRole =
      line.length < 90 &&
      !line.startsWith("http") &&
      (/\b(lead|engineer|designer|manager|director|producer|assistant|operator|writer|editor)\b/i.test(
        line,
      ) ||
        /[—–|-]/.test(line));

    if (dated || (looksRole && current && current.bullets.length > 0)) {
      flush();
      const parsed = splitRoleLine(line);
      current = {
        id: uid(),
        role: parsed.role,
        org: parsed.org,
        location: parsed.location,
        start: parsed.start,
        end: parsed.end,
        bullets: parsed.rest ? [parsed.rest] : [],
      };
      continue;
    }
    if (!current) {
      current = { id: uid(), role: line, org: "", location: "", start: "", end: "", bullets: [] };
      continue;
    }
    if (line.length < 70 && !current.org && !/^[-\u2022]/.test(raw) && current.bullets.length === 0) {
      current.org = line;
    } else {
      current.bullets.push(line);
    }
  }
  flush();
  return jobs.filter((j) => j.role || j.bullets.length);
}

function splitRoleLine(line: string) {
  const datePart = line.match(
    /((?:20\d{2}|19\d{2})\s*[–—-]\s*(?:20\d{2}|19\d{2}|[Pp]resent)|(?:20\d{2}|19\d{2}|[Pp]resent))/,
  );
  let start = "";
  let end = "";
  if (datePart) {
    const bits = datePart[1].split(/\s*[–—-]\s*/);
    start = bits[0] ?? "";
    end = bits[1] ?? "";
  }
  const withoutDates = line.replace(datePart?.[0] ?? "", "").replace(/[·|]/g, "—");
  const parts = withoutDates.split(/\s+[—–-]\s+/).map(normalize).filter(Boolean);
  return {
    role: parts[0] ?? line,
    org: parts[1] ?? "",
    location: parts[2] ?? "",
    start,
    end,
    rest: "",
  };
}

function parseEducation(lines: string[]): EducationItem[] {
  const items: EducationItem[] = [];
  for (const line of lines) {
    if (SECTION.test(line) || line.length < 3) continue;
    const year = line.match(/(20\d{2}|19\d{2})/)?.[1] ?? "";
    const parts = line.split(/[—–|,]/).map(normalize).filter(Boolean);
    items.push({
      id: uid(),
      school: parts.find((p) => /university|college|school|institute/i.test(p)) ?? parts[1] ?? parts[0] ?? "",
      degree: parts.find((p) => /b\.|m\.|ba|bs|ma|phd|bachelor|master/i.test(p)) ?? parts[0] ?? line,
      year,
      detail: "",
    });
  }
  return items;
}

function parseSkills(lines: string[], full: string): string[] {
  const blob = (lines.length ? lines.join(" ") : "").trim();
  const source = blob || (full.match(/skills?\s*[:\n]([\s\S]{0,400})/i)?.[1] ?? "");
  const parts = source
    .split(/[,;|\u2022\n]/)
    .map((s) => s.replace(/^[-]\s*/, "").trim())
    .filter((s) => s.length > 1 && s.length < 40 && !SECTION.test(s));
  return [...new Set(parts)].slice(0, 24);
}

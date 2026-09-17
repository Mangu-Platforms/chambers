import { uid } from "./ids";
import { emptyResume } from "./sample";
import type { EducationItem, ExperienceItem, Resume } from "./types";
import { normalize } from "./text";

const SECTION =
  /^(summary|profile|objective|about|experience|work experience|work history|employment|professional experience|education|skills|technical skills|core competencies|tools|projects|selected work|additional|certifications|awards|languages|publications|volunteer)\s*:?$/i;

const LINKEDIN_TYPE = /·\s*(full-?time|part-?time|contract|internship|freelance|self-employed)\b/i;

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

  const summaryBlock = blocks.summary ?? blocks.profile ?? blocks.objective ?? blocks.about;
  if (summaryBlock) resume.summary = summaryBlock.filter((l) => !SECTION.test(l)).join(" ").trim();

  const expLines =
    blocks.experience ??
    blocks["work experience"] ??
    blocks["work history"] ??
    blocks.employment ??
    blocks["professional experience"] ??
    [];
  resume.experience = parseJobs(expLines);

  const eduLines = blocks.education ?? [];
  resume.education = parseEducation(eduLines);

  const skillLines = blocks.skills ?? blocks.tools ?? blocks["technical skills"] ?? blocks["core competencies"] ?? [];
  resume.skills = parseSkills(skillLines, text);

  const extras: Resume["extras"] = [];
  const extraSrc = blocks["selected work"] ?? blocks.projects ?? blocks.additional;
  if (extraSrc?.length) {
    extras.push({
      id: uid(),
      label: "Selected work",
      items: extraSrc.filter((l) => !SECTION.test(l)).map((l) => l.replace(/^[-•]\s*/, "")),
    });
  }
  const certs = blocks.certifications ?? blocks.awards;
  if (certs?.length) {
    extras.push({
      id: uid(),
      label: "Certifications",
      items: certs.filter((l) => !SECTION.test(l)).map((l) => l.replace(/^[-•]\s*/, "")),
    });
  }
  const langs = blocks.languages;
  if (langs?.length) {
    extras.push({
      id: uid(),
      label: "Languages",
      items: langs.filter((l) => !SECTION.test(l)).map((l) => l.replace(/^[-•]\s*/, "")),
    });
  }
  resume.extras = extras;

  if (!resume.experience.length) {
    resume.experience = parseJobs(lines.slice(3));
  }
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
  const line = head.find((l) => l.length > 2 && l.length < 48 && !l.includes("@") && !/\d{3}/.test(l));
  return line ?? "";
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
  const line = head.find(
    (l) =>
      /remote|york|newark|austin|francisco|boston|london|city|nj|ny|tx|ca/i.test(l) &&
      !l.includes("@") &&
      l.length < 60,
  );
  return line ?? "";
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
  const linkedinDate =
    /^(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(20\d{2}|19\d{2})\s*[–—-]\s*(present|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(20\d{2}|19\d{2}))/i;

  const flush = () => {
    if (current && (current.role || current.org || current.bullets.length)) jobs.push(current);
    current = null;
  };

  for (const raw of lines) {
    const line = raw.replace(/^[-•●]\s*/, "");
    if (SECTION.test(line)) continue;

    if (current && LINKEDIN_TYPE.test(line) && !current.org) {
      current.org = line.split("·")[0]?.trim() ?? line;
      continue;
    }

    const liDate = line.match(linkedinDate);
    if (current && liDate && current.bullets.length === 0 && !current.start) {
      current.start = liDate[1] ?? "";
      current.end = /present/i.test(liDate[2] ?? "") ? "Present" : (liDate[3] ?? liDate[2] ?? "");
      const loc = line.split("·")[1]?.trim();
      if (loc && !/\d/.test(loc)) current.location = loc;
      continue;
    }

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
      current = {
        id: uid(),
        role: line,
        org: "",
        location: "",
        start: "",
        end: "",
        bullets: [],
      };
      continue;
    }
    if (line.length < 70 && !current.org && !/^[-•]/.test(raw) && current.bullets.length === 0) {
      current.org = line;
    } else {
      current.bullets.push(line);
    }
  }
  flush();
  return jobs.filter((j) => j.role || j.bullets.length);
}

function splitRoleLine(line: string): {
  role: string;
  org: string;
  location: string;
  start: string;
  end: string;
  rest: string;
} {
  const datePart = line.match(
    /((?:20\d{2}|19\d{2})\s*[–—-]\s*(?:20\d{2}|19\d{2}|[Pp]resent)|(?:20\d{2}|19\d{2}|[Pp]resent))/,
  );
  let start = "";
  let end = "";
  if (datePart) {
    const bits = datePart[1].split(/\s*[–—-]\s*/);
    start = bits[0] ?? "";
    end = bits[1] ?? (/\d{4}/.test(bits[0] ?? "") ? "" : bits[0] ?? "");
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
    .split(/[,;|•\n]/)
    .map((s) => s.replace(/^[-]\s*/, "").trim())
    .filter((s) => s.length > 1 && s.length < 40 && !SECTION.test(s));
  return [...new Set(parts)].slice(0, 24);
}

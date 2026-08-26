import type { ResumeData } from "@/lib/resume/schema";
import { cleanLine, cleanUrl, displayUrl } from "@/lib/resume/sanitize";

/**
 * ATS plain-text export. Deterministic, single-column, no glyph art —
 * exactly what resume parsers want. Shared by the .txt download and
 * as the paragraph source for DOCX.
 */

function range(start: string, end: string): string {
  const s = cleanLine(start);
  const e = cleanLine(end);
  if (s && e) return `${s} - ${e}`;
  return s || e || "";
}

function header(title: string): string[] {
  return ["", title.toUpperCase(), "=".repeat(title.length), ""];
}

export function resumeToPlainText(data: ResumeData): string {
  const lines: string[] = [];
  const p = data.profile;

  if (cleanLine(p.fullName)) lines.push(cleanLine(p.fullName));
  if (cleanLine(p.headline)) lines.push(cleanLine(p.headline));
  const contact = [cleanLine(p.location), cleanLine(p.email), cleanLine(p.phone)]
    .filter(Boolean)
    .join(" | ");
  if (contact) lines.push(contact);
  for (const link of p.links) {
    const url = cleanUrl(link.url);
    if (url) lines.push(`${cleanLine(link.label) || "Link"}: ${displayUrl(url)}`);
  }

  if (cleanLine(p.summary)) {
    lines.push(...header("Summary"), cleanLine(p.summary));
  }

  if (data.experience.length > 0) {
    lines.push(...header("Experience"));
    for (const job of data.experience) {
      const when = range(job.start, job.end);
      lines.push([cleanLine(job.role), when].filter(Boolean).join("  |  "));
      const org = [cleanLine(job.organization), cleanLine(job.location)].filter(Boolean).join(", ");
      if (org) lines.push(org);
      for (const b of job.bullets) {
        if (cleanLine(b)) lines.push(`- ${cleanLine(b)}`);
      }
      lines.push("");
    }
  }

  if (data.projects.length > 0) {
    lines.push(...header("Projects"));
    for (const project of data.projects) {
      const url = cleanUrl(project.url);
      lines.push([cleanLine(project.name), url ? displayUrl(url) : ""].filter(Boolean).join("  |  "));
      if (cleanLine(project.description)) lines.push(cleanLine(project.description));
      for (const b of project.bullets) {
        if (cleanLine(b)) lines.push(`- ${cleanLine(b)}`);
      }
      lines.push("");
    }
  }

  if (data.education.length > 0) {
    lines.push(...header("Education"));
    for (const ed of data.education) {
      const when = range(ed.start, ed.end);
      lines.push([cleanLine(ed.degree), when].filter(Boolean).join("  |  "));
      const inst = [cleanLine(ed.institution), cleanLine(ed.location)].filter(Boolean).join(", ");
      if (inst) lines.push(inst);
      if (cleanLine(ed.notes)) lines.push(cleanLine(ed.notes));
      lines.push("");
    }
  }

  const skills = data.skills.map((s) => cleanLine(s.name)).filter(Boolean);
  if (skills.length > 0) {
    lines.push(...header("Skills"), skills.join(", "));
  }

  for (const section of data.custom) {
    if (!cleanLine(section.title) && section.items.length === 0) continue;
    lines.push(...header(cleanLine(section.title) || "Additional"));
    for (const item of section.items) {
      const when = cleanLine(item.when);
      lines.push([cleanLine(item.heading), when].filter(Boolean).join("  |  "));
      if (cleanLine(item.sub)) lines.push(cleanLine(item.sub));
      for (const b of item.bullets) {
        if (cleanLine(b)) lines.push(`- ${cleanLine(b)}`);
      }
      lines.push("");
    }
  }

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

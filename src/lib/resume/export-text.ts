import type { CoverLetter, Resume } from "./types";

export function resumeAsText(resume: Resume): string {
  const i = resume.identity;
  const contact = [i.location, i.email, i.phone, i.website, i.linkedin].filter(Boolean).join(" · ");
  const lines: string[] = [];
  if (i.name) lines.push(i.name);
  if (i.title) lines.push(i.title);
  if (contact) lines.push(contact);
  if (resume.summary) {
    lines.push("", "SUMMARY", resume.summary);
  }
  if (resume.experience.length) {
    lines.push("", "SELECTED WORK");
    for (const job of resume.experience) {
      const when = [job.start, job.end].filter(Boolean).join(" — ");
      lines.push("", [job.role, job.org].filter(Boolean).join(" · ") + (when ? ` (${when})` : ""));
      if (job.location) lines.push(job.location);
      for (const b of job.bullets.filter(Boolean)) lines.push(`• ${b}`);
    }
  }
  if (resume.education.length) {
    lines.push("", "EDUCATION");
    for (const ed of resume.education) {
      lines.push([ed.degree, ed.school, ed.year].filter(Boolean).join(" · "));
      if (ed.detail) lines.push(ed.detail);
    }
  }
  if (resume.skills.filter(Boolean).length) {
    lines.push("", "SKILLS", resume.skills.filter(Boolean).join(", "));
  }
  for (const x of resume.extras) {
    const items = x.items.filter(Boolean);
    if (!x.label && !items.length) continue;
    lines.push("", (x.label || "ADDITIONAL").toUpperCase());
    for (const it of items) lines.push(`• ${it}`);
  }
  return lines.join("\n").trim() + "\n";
}

export function resumeAsMarkdown(resume: Resume): string {
  const i = resume.identity;
  const contact = [i.location, i.email, i.phone, i.website, i.linkedin].filter(Boolean).join(" · ");
  const lines: string[] = [];
  if (i.name) lines.push(`# ${i.name}`);
  if (i.title) lines.push(`*${i.title}*`);
  if (contact) lines.push(contact);
  if (resume.summary) {
    lines.push("", "## Summary", "", resume.summary);
  }
  if (resume.experience.length) {
    lines.push("", "## Selected work");
    for (const job of resume.experience) {
      const when = [job.start, job.end].filter(Boolean).join(" — ");
      const head = [job.role, job.org].filter(Boolean).join(" · ");
      lines.push("", `### ${head || "Role"}`);
      if (when || job.location) lines.push(`*${[when, job.location].filter(Boolean).join(" · ")}*`);
      for (const b of job.bullets.filter(Boolean)) lines.push(`- ${b}`);
    }
  }
  if (resume.education.length) {
    lines.push("", "## Education");
    for (const ed of resume.education) {
      lines.push(`- ${[ed.degree, ed.school, ed.year].filter(Boolean).join(" · ")}`);
    }
  }
  if (resume.skills.filter(Boolean).length) {
    lines.push("", "## Skills", "", resume.skills.filter(Boolean).join(", "));
  }
  for (const x of resume.extras) {
    const items = x.items.filter(Boolean);
    if (!x.label && !items.length) continue;
    lines.push("", `## ${x.label || "Additional"}`);
    for (const it of items) lines.push(`- ${it}`);
  }
  return lines.join("\n").trim() + "\n";
}

export function letterAsText(letter: CoverLetter, name: string): string {
  const lines: string[] = [];
  if (name) lines.push(name, "");
  if (letter.role || letter.company) {
    lines.push([letter.role, letter.company].filter(Boolean).join(" · "), "");
  }
  lines.push(`Dear ${letter.greeting || "Hiring team"},`, "");
  for (const p of letter.paragraphs.filter(Boolean)) {
    lines.push(p, "");
  }
  if (letter.closing) lines.push(letter.closing, "");
  lines.push((letter.signoff || "Sincerely").replace(/\n/g, "\n"));
  if (name && !letter.signoff?.includes(name.split(" ")[0] ?? "")) {
    lines.push("", name);
  }
  return lines.join("\n").trim() + "\n";
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

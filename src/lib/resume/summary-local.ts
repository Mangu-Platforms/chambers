import type { Resume } from "./types";
import { uniqueKeywords } from "./text";

export function writeSummaryLocal(resume: Resume, jobDescription = ""): string {
  const title =
    resume.identity.title.split("·")[0]?.trim() ||
    resume.experience[0]?.role ||
    "Professional";
  const proof = resume.experience[0]?.bullets.find((b) => b.trim()) ?? "";
  const skills = resume.skills.filter(Boolean).slice(0, 4);
  const hay = [
    resume.summary,
    ...resume.experience.flatMap((j) => [j.role, j.org, ...j.bullets]),
    ...resume.skills,
  ]
    .join(" ")
    .toLowerCase();
  const evidenced = uniqueKeywords(jobDescription)
    .filter((k) => hay.includes(k.toLowerCase()))
    .slice(0, 3);

  const parts: string[] = [];
  if (proof) {
    parts.push(`${title} who ${lcFirst(stripPeriod(proof))}.`);
  } else if (resume.summary.trim()) {
    return resume.summary.trim();
  } else {
    parts.push(`${title} with a record of shipping work other people can trust.`);
  }
  if (skills.length) {
    parts.push(`Daily tools: ${skills.join(", ")}.`);
  }
  if (evidenced.length) {
    parts.push(
      `The posting’s ${evidenced.join(", ")} already show up in work that has shipped.`,
    );
  }
  return parts.join(" ");
}

function stripPeriod(s: string): string {
  return s.trim().replace(/\.$/, "");
}

function lcFirst(s: string): string {
  const t = s.trim();
  if (!t) return t;
  return t.charAt(0).toLowerCase() + t.slice(1);
}

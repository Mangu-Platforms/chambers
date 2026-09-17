import type { Resume } from "./types";
import { resumePlainText, uniqueKeywords } from "./text";

const GENERIC = new Set(
  `systems system product products design designs press team teams work role roles
   operations operation process processes people person company companies paper papers`.split(/\s+/),
);

export type KeywordBuckets = {
  inSkills: string[];
  inBody: string[];
  missing: string[];
  coverage: number;
};

function skillHit(skills: string[], term: string): boolean {
  const t = term.toLowerCase();
  return skills.some((s) => {
    const x = s.toLowerCase();
    return x === t || x.includes(t) || t.includes(x);
  });
}

function keepTerm(term: string): boolean {
  const t = term.trim().toLowerCase();
  if (t.length < 3) return false;
  if (!t.includes(" ") && GENERIC.has(t)) return false;
  return true;
}

export function classifyKeywords(resume: Resume, jobDescription: string): KeywordBuckets {
  const keywords = uniqueKeywords(jobDescription).filter(keepTerm);
  const body = resumePlainText(resume).toLowerCase();
  const inSkills: string[] = [];
  const inBody: string[] = [];
  const missing: string[] = [];
  for (const term of keywords) {
    const t = term.toLowerCase();
    if (skillHit(resume.skills, term)) inSkills.push(term);
    else if (body.includes(t)) inBody.push(term);
    else missing.push(term);
  }
  const evidenced = inSkills.length + inBody.length;
  const coverage =
    keywords.length === 0 ? 0 : Math.round((evidenced / keywords.length) * 100);
  return { inSkills, inBody, missing, coverage };
}

export function canPromote(resume: Resume, term: string): boolean {
  const t = term.trim().toLowerCase();
  if (t.length < 2) return false;
  if (skillHit(resume.skills, t)) return false;
  return resumePlainText(resume).toLowerCase().includes(t);
}

export function withPromotedSkill(resume: Resume, term: string): Resume | null {
  const cleaned = term.trim();
  if (!canPromote(resume, cleaned)) return null;
  return { ...resume, skills: [...resume.skills.filter(Boolean), cleaned].slice(0, 24) };
}

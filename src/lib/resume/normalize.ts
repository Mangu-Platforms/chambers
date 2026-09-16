import { uid } from "./ids";
import { emptyResume } from "./sample";
import type { CoverLetter, EducationItem, ExperienceItem, ExtraSection, Resume } from "./types";

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function arr(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

export function normalizeResume(raw: unknown): Resume {
  const base = emptyResume();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Record<string, unknown>;
  const identity = (r.identity ?? r) as Record<string, unknown>;
  const experience = arr(r.experience).map(normalizeJob).filter((j) => j.role || j.org);
  const education = arr(r.education).map(normalizeEdu).filter((e) => e.school || e.degree);
  const skills = arr(r.skills)
    .map((s) => (typeof s === "string" ? s : String((s as { name?: string }).name ?? "")))
    .map((s) => s.trim())
    .filter(Boolean);
  const extras = arr(r.extras).map(normalizeExtra).filter((e) => e.label || e.items.length);
  return {
    identity: {
      name: str(identity.name) || str(r.name) || base.identity.name,
      title: str(identity.title) || str(r.title) || str(r.headline) || base.identity.title,
      location: str(identity.location) || str(r.location),
      email: str(identity.email) || str(r.email),
      phone: str(identity.phone) || str(r.phone),
      website: str(identity.website) || str(r.website) || str(r.url),
      linkedin: str(identity.linkedin) || str(r.linkedin),
    },
    summary: str(r.summary) || str(r.profile),
    experience: experience.length ? experience : base.experience,
    education,
    skills,
    extras,
  };
}

function normalizeJob(raw: unknown): ExperienceItem {
  const j = (raw ?? {}) as Record<string, unknown>;
  const bullets = arr(j.bullets ?? j.highlights ?? j.achievements)
    .map((b) => (typeof b === "string" ? b : str((b as { text?: string }).text)))
    .map((b) => b.replace(/^[-•\s]+/, "").trim())
    .filter(Boolean);
  return {
    id: str(j.id) || uid(),
    role: str(j.role) || str(j.title) || str(j.position),
    org: str(j.org) || str(j.company) || str(j.organization),
    location: str(j.location),
    start: str(j.start) || str(j.startDate),
    end: str(j.end) || str(j.endDate) || str(j.to),
    bullets,
  };
}

function normalizeEdu(raw: unknown): EducationItem {
  const e = (raw ?? {}) as Record<string, unknown>;
  return {
    id: str(e.id) || uid(),
    school: str(e.school) || str(e.institution),
    degree: str(e.degree) || str(e.study),
    year: str(e.year) || str(e.end) || str(e.date),
    detail: str(e.detail) || str(e.notes),
  };
}

function normalizeExtra(raw: unknown): ExtraSection {
  const e = (raw ?? {}) as Record<string, unknown>;
  return {
    id: str(e.id) || uid(),
    label: str(e.label) || str(e.title) || "Additional",
    items: arr(e.items ?? e.bullets)
      .map((i) => (typeof i === "string" ? i.trim() : ""))
      .filter(Boolean),
  };
}

export function normalizeLetter(raw: unknown, fallback: CoverLetter): CoverLetter {
  if (!raw || typeof raw !== "object") return fallback;
  const r = raw as Record<string, unknown>;
  const paragraphs = arr(r.paragraphs ?? r.body)
    .map((p) => (typeof p === "string" ? p.trim() : ""))
    .filter(Boolean);
  return {
    company: str(r.company) || fallback.company,
    role: str(r.role) || fallback.role,
    greeting: str(r.greeting) || fallback.greeting || "Hiring team",
    paragraphs: paragraphs.length ? paragraphs : fallback.paragraphs,
    closing: str(r.closing) || fallback.closing || "Thank you for your time.",
    signoff: str(r.signoff) || fallback.signoff || "Sincerely",
  };
}

export function cloneResume(resume: Resume): Resume {
  return JSON.parse(JSON.stringify(resume)) as Resume;
}

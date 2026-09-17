import { uid } from "./ids";
import { cloneResume, normalizeLetter, normalizeResume } from "./normalize";
import { emptyLetter, emptyResume } from "./sample";
import type { CoverLetter, Density, LetterTone, Resume, TailorNotes, TemplateId } from "./types";
import { DENSITIES, LETTER_TONES, TEMPLATE_IDS } from "./types";

export const PACK_KIND = "chambers-studio";
export const PACK_VERSION = 1;

export type ChambersPack = {
  v: number;
  kind: typeof PACK_KIND;
  savedAt: string;
  resume: Resume;
  templateId: TemplateId;
  jobDescription: string;
  targetCompany: string;
  targetRole: string;
  letter: CoverLetter;
  notes: TailorNotes | null;
  letterTone?: LetterTone;
  density?: Density;
};

export function isTemplateId(v: unknown): v is TemplateId {
  return typeof v === "string" && (TEMPLATE_IDS as readonly string[]).includes(v);
}

function isTone(v: unknown): v is LetterTone {
  return typeof v === "string" && (LETTER_TONES as readonly string[]).includes(v);
}

function isDensity(v: unknown): v is Density {
  return typeof v === "string" && (DENSITIES as readonly string[]).includes(v);
}

export function makePack(input: {
  resume: Resume;
  templateId: TemplateId;
  jobDescription: string;
  targetCompany: string;
  targetRole: string;
  letter: CoverLetter;
  notes: TailorNotes | null;
  letterTone?: LetterTone;
  density?: Density;
}): ChambersPack {
  return {
    v: PACK_VERSION,
    kind: PACK_KIND,
    savedAt: new Date().toISOString(),
    resume: cloneResume(input.resume),
    templateId: input.templateId,
    jobDescription: input.jobDescription,
    targetCompany: input.targetCompany,
    targetRole: input.targetRole,
    letter: { ...input.letter, paragraphs: input.letter.paragraphs.slice() },
    notes: input.notes
      ? {
          summary: input.notes.summary,
          moved: input.notes.moved.slice(),
          rewrote: input.notes.rewrote.slice(),
          missing: input.notes.missing.slice(),
        }
      : null,
    letterTone: input.letterTone ?? "calm",
    density: input.density ?? "regular",
  };
}

export function parseChambersPack(raw: unknown): ChambersPack | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (o.kind !== PACK_KIND) return null;
  const resume = normalizeResume(o.resume ?? o);
  const letter = normalizeLetter(o.letter, emptyLetter());
  return {
    v: PACK_VERSION,
    kind: PACK_KIND,
    savedAt: typeof o.savedAt === "string" ? o.savedAt : new Date().toISOString(),
    resume,
    templateId: isTemplateId(o.templateId) ? o.templateId : "letter",
    jobDescription: typeof o.jobDescription === "string" ? o.jobDescription : "",
    targetCompany: typeof o.targetCompany === "string" ? o.targetCompany : "",
    targetRole: typeof o.targetRole === "string" ? o.targetRole : "",
    letter,
    notes:
      o.notes && typeof o.notes === "object"
        ? {
            summary: String((o.notes as TailorNotes).summary ?? ""),
            moved: Array.isArray((o.notes as TailorNotes).moved)
              ? (o.notes as TailorNotes).moved.map(String)
              : [],
            rewrote: Array.isArray((o.notes as TailorNotes).rewrote)
              ? (o.notes as TailorNotes).rewrote.map(String)
              : [],
            missing: Array.isArray((o.notes as TailorNotes).missing)
              ? (o.notes as TailorNotes).missing.map(String)
              : [],
          }
        : null,
    letterTone: isTone(o.letterTone) ? o.letterTone : "calm",
    density: isDensity(o.density) ? o.density : "regular",
  };
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/** JSON Resume (jsonresume.org) → Chambers resume. */
export function fromJsonResume(raw: unknown): Resume | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (!o.basics && !o.work && !o.education) return null;
  const basics = (o.basics ?? {}) as Record<string, unknown>;
  const profiles = Array.isArray(basics.profiles) ? basics.profiles : [];
  const linkedin = profiles.find((p) => {
    const n = String((p as { network?: string }).network ?? "").toLowerCase();
    return n.includes("linkedin");
  }) as { url?: string } | undefined;
  const website =
    str(basics.url) ||
    str((profiles.find((p) => (p as { url?: string }).url) as { url?: string } | undefined)?.url);

  const work = Array.isArray(o.work) ? o.work : [];
  const education = Array.isArray(o.education) ? o.education : [];
  const skills = Array.isArray(o.skills) ? o.skills : [];
  const projects = Array.isArray(o.projects) ? o.projects : [];

  const resume = emptyResume();
  const loc = basics.location as { city?: string; region?: string } | undefined;
  resume.identity = {
    name: str(basics.name),
    title: str(basics.label),
    location: [str(loc?.city), str(loc?.region)].filter(Boolean).join(", "),
    email: str(basics.email),
    phone: str(basics.phone),
    website,
    linkedin: str(linkedin?.url).replace(/^https?:\/\//, ""),
  };
  resume.summary = str(basics.summary);
  resume.experience = work.map((w) => {
    const j = w as Record<string, unknown>;
    const highlights = Array.isArray(j.highlights) ? j.highlights.map((h) => String(h)) : [];
    return {
      id: uid(),
      role: str(j.position) || str(j.role),
      org: str(j.name) || str(j.company),
      location: str(j.location),
      start: yearish(j.startDate),
      end: yearish(j.endDate) || (j.endDate ? "" : "Present"),
      bullets: highlights,
    };
  });
  resume.education = education.map((e) => {
    const ed = e as Record<string, unknown>;
    return {
      id: uid(),
      school: str(ed.institution),
      degree: [str(ed.studyType), str(ed.area)].filter(Boolean).join(", "),
      year: yearish(ed.endDate) || yearish(ed.startDate),
      detail: str(ed.score),
    };
  });
  resume.skills = skills
    .flatMap((s) => {
      const sk = s as { name?: string; keywords?: string[] };
      return [str(sk.name), ...(sk.keywords ?? []).map(String)];
    })
    .filter(Boolean)
    .slice(0, 24);
  if (projects.length) {
    resume.extras = [
      {
        id: uid(),
        label: "Projects",
        items: projects
          .map((p) => {
            const pr = p as { name?: string; description?: string };
            return [str(pr.name), str(pr.description)].filter(Boolean).join(" — ");
          })
          .filter(Boolean),
      },
    ];
  }
  return resume;
}

export function toJsonResume(resume: Resume): Record<string, unknown> {
  return {
    basics: {
      name: resume.identity.name,
      label: resume.identity.title,
      email: resume.identity.email,
      phone: resume.identity.phone,
      url: resume.identity.website
        ? resume.identity.website.startsWith("http")
          ? resume.identity.website
          : `https://${resume.identity.website}`
        : "",
      summary: resume.summary,
      location: { city: resume.identity.location },
      profiles: resume.identity.linkedin
        ? [{ network: "LinkedIn", url: resume.identity.linkedin.startsWith("http") ? resume.identity.linkedin : `https://${resume.identity.linkedin}` }]
        : [],
    },
    work: resume.experience.map((j) => ({
      name: j.org,
      position: j.role,
      location: j.location,
      startDate: j.start,
      endDate: /present/i.test(j.end) ? undefined : j.end,
      highlights: j.bullets.filter(Boolean),
    })),
    education: resume.education.map((e) => ({
      institution: e.school,
      area: e.degree,
      endDate: e.year,
      score: e.detail,
    })),
    skills: resume.skills.filter(Boolean).map((name) => ({ name })),
    projects: resume.extras.flatMap((x) =>
      x.items.filter(Boolean).map((item) => ({ name: x.label, description: item })),
    ),
  };
}

function yearish(v: unknown): string {
  const s = str(v);
  if (!s) return "";
  const y = s.match(/(20\d{2}|19\d{2})/);
  return y?.[1] ?? s.slice(0, 7);
}

export type ImportResult =
  | { kind: "pack"; pack: ChambersPack }
  | { kind: "resume"; resume: Resume };

export function importAnyJson(text: string): ImportResult | null {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return null;
  }
  const pack = parseChambersPack(raw);
  if (pack) return { kind: "pack", pack };
  const jr = fromJsonResume(raw);
  if (jr && (jr.identity.name || jr.experience.length)) return { kind: "resume", resume: jr };
  if (raw && typeof raw === "object" && ("identity" in (raw as object) || "experience" in (raw as object))) {
    return { kind: "resume", resume: normalizeResume(raw) };
  }
  return null;
}

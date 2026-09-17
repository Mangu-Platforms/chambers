export const TEMPLATE_IDS = [
  "letter",
  "compact",
  "executive",
  "editorial",
  "sidebar",
  "classic",
] as const;

export type TemplateId = (typeof TEMPLATE_IDS)[number];

export const LETTER_TONES = ["calm", "direct", "warm"] as const;
export type LetterTone = (typeof LETTER_TONES)[number];

export const DENSITIES = ["regular", "tight"] as const;
export type Density = (typeof DENSITIES)[number];

export type ResumeIdentity = {
  name: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  website: string;
  linkedin: string;
};

export type ExperienceItem = {
  id: string;
  role: string;
  org: string;
  location: string;
  start: string;
  end: string;
  bullets: string[];
};

export type EducationItem = {
  id: string;
  school: string;
  degree: string;
  year: string;
  detail: string;
};

export type ExtraSection = {
  id: string;
  label: string;
  items: string[];
};

export type Resume = {
  identity: ResumeIdentity;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  extras: ExtraSection[];
};

export type CoverLetter = {
  company: string;
  role: string;
  greeting: string;
  paragraphs: string[];
  closing: string;
  signoff: string;
};

export type AtsReport = {
  score: number;
  matched: string[];
  missing: string[];
  extras: string[];
  checks: { id: string; label: string; pass: boolean; detail: string }[];
};

export type TailorNotes = {
  summary: string;
  moved: string[];
  rewrote: string[];
  missing: string[];
};

export type TemplateMeta = {
  id: TemplateId;
  name: string;
  blurb: string;
  tone: string;
  ats: "high" | "medium";
  bestFor: string;
};

export type SavedVersion = {
  id: string;
  name: string;
  savedAt: string;
  resume: Resume;
  templateId: TemplateId;
  jobDescription: string;
  targetCompany: string;
  targetRole: string;
  letter: CoverLetter;
  notes: TailorNotes | null;
  letterTone: LetterTone;
  density: Density;
};

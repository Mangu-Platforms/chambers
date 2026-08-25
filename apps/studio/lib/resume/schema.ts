import { z } from "zod";

/**
 * Chambers Studio resume document model.
 * This is the single shape shared by the editor, the live preview sheet,
 * every export path, and the Supabase `documents.data` JSONB column.
 */

const shortText = z.string().max(200);
const mediumText = z.string().max(400);
const longText = z.string().max(2000);

export const linkSchema = z.object({
  id: z.string(),
  label: shortText.default(""),
  url: z.string().max(500).default(""),
});

export const profileSchema = z.object({
  fullName: shortText.default(""),
  headline: mediumText.default(""),
  email: shortText.default(""),
  phone: shortText.default(""),
  location: shortText.default(""),
  links: z.array(linkSchema).max(8).default([]),
  summary: longText.default(""),
});

export const experienceSchema = z.object({
  id: z.string(),
  role: shortText.default(""),
  organization: shortText.default(""),
  location: shortText.default(""),
  start: shortText.default(""),
  end: shortText.default(""),
  bullets: z.array(z.string().max(600)).max(12).default([]),
});

export const educationSchema = z.object({
  id: z.string(),
  degree: shortText.default(""),
  institution: shortText.default(""),
  location: shortText.default(""),
  start: shortText.default(""),
  end: shortText.default(""),
  notes: mediumText.default(""),
});

export const skillSchema = z.object({
  id: z.string(),
  name: shortText.default(""),
});

export const projectSchema = z.object({
  id: z.string(),
  name: shortText.default(""),
  url: z.string().max(500).default(""),
  description: mediumText.default(""),
  bullets: z.array(z.string().max(600)).max(8).default([]),
});

export const customItemSchema = z.object({
  id: z.string(),
  heading: shortText.default(""),
  sub: shortText.default(""),
  when: shortText.default(""),
  bullets: z.array(z.string().max(600)).max(8).default([]),
});

export const customSectionSchema = z.object({
  id: z.string(),
  title: shortText.default(""),
  items: z.array(customItemSchema).max(12).default([]),
});

export const resumeDataSchema = z.object({
  profile: profileSchema.default({}),
  experience: z.array(experienceSchema).max(20).default([]),
  education: z.array(educationSchema).max(10).default([]),
  skills: z.array(skillSchema).max(40).default([]),
  projects: z.array(projectSchema).max(12).default([]),
  custom: z.array(customSectionSchema).max(6).default([]),
});

export const templateIds = ["classic", "compact", "executive"] as const;
export const templateIdSchema = z.enum(templateIds);

export const documentSchema = z.object({
  id: z.string(),
  title: z.string().max(200).default("Untitled"),
  template: templateIdSchema.default("classic"),
  data: resumeDataSchema.default({}),
  isPublic: z.boolean().default(false),
  slug: z.string().max(80).nullable().default(null),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ResumeLink = z.infer<typeof linkSchema>;
export type ResumeProfile = z.infer<typeof profileSchema>;
export type ResumeExperience = z.infer<typeof experienceSchema>;
export type ResumeEducation = z.infer<typeof educationSchema>;
export type ResumeSkill = z.infer<typeof skillSchema>;
export type ResumeProject = z.infer<typeof projectSchema>;
export type ResumeCustomItem = z.infer<typeof customItemSchema>;
export type ResumeCustomSection = z.infer<typeof customSectionSchema>;
export type ResumeData = z.infer<typeof resumeDataSchema>;
export type TemplateId = z.infer<typeof templateIdSchema>;
export type StudioDocument = z.infer<typeof documentSchema>;

export function emptyResume(): ResumeData {
  return resumeDataSchema.parse({});
}

/** Parse untrusted stored JSON into a valid ResumeData, dropping anything malformed. */
export function coerceResumeData(input: unknown): ResumeData {
  const parsed = resumeDataSchema.safeParse(input);
  if (parsed.success) return parsed.data;
  return emptyResume();
}

export function coerceTemplate(input: unknown): TemplateId {
  const parsed = templateIdSchema.safeParse(input);
  return parsed.success ? parsed.data : "classic";
}

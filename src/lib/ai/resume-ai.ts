import { normalizeLetter, normalizeResume } from "@/lib/resume/normalize";
import { emptyLetter } from "@/lib/resume/sample";
import type { CoverLetter, Resume, TailorNotes } from "@/lib/resume/types";

type Ok<T> = { ok: true } & T;
type Err = { ok: false; error: string };
type Result<T> = Ok<T> | Err;

export async function parseResumeAi(_input: {
  data: { text: string };
}): Promise<Result<{ resume: Resume }>> {
  return { ok: false, error: "AI is not available in this environment" };
}

export async function tailorResumeAi(_input: {
  data: { resume: Resume; jobDescription: string };
}): Promise<Result<{ resume: Resume; notes: TailorNotes }>> {
  return { ok: false, error: "AI is not available in this environment" };
}

export async function writeCoverLetterAi(_input: {
  data: { resume: Resume; jobDescription: string; company: string; role: string };
}): Promise<Result<{ letter: CoverLetter }>> {
  return { ok: false, error: "AI is not available in this environment" };
}

export async function rewriteBulletAi(_input: {
  data: { bullet: string; context: string; jobDescription?: string };
}): Promise<Result<{ variants: string[] }>> {
  return { ok: false, error: "AI is not available in this environment" };
}

export async function writeSummaryAi(_input: {
  data: { resume: Resume; jobDescription?: string };
}): Promise<Result<{ summary: string }>> {
  return { ok: false, error: "AI is not available in this environment" };
}

export function parseAiResume(raw: unknown): Resume {
  return normalizeResume(raw);
}

export function parseAiLetter(raw: unknown, company: string, role: string): CoverLetter {
  return normalizeLetter(raw, { ...emptyLetter(), company, role });
}

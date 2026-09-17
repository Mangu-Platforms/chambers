import { createServerFn } from "@tanstack/react-start";
import { normalizeLetter, normalizeResume } from "@/lib/resume/normalize";
import { emptyLetter } from "@/lib/resume/sample";
import type { CoverLetter, Resume, TailorNotes } from "@/lib/resume/types";

type Ok<T> = { ok: true } & T;
type Err = { ok: false; error: string };
type Result<T> = Ok<T> | Err;

const MODEL = "grok-4.5";
const BASE = "https://api.x.ai/v1/chat/completions";

async function chat(opts: {
  system: string;
  user: string;
  maxTokens: number;
}): Promise<Result<{ text: string }>> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "AI is not available in this environment" };
  }
  const res = await fetch(BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.4,
      max_tokens: opts.maxTokens,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.user },
      ],
    }),
  });
  if (!res.ok) {
    return { ok: false, error: `xAI API error ${res.status}` };
  }
  const body = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = body.choices?.[0]?.message?.content ?? "";
  if (!text) return { ok: false, error: "Empty model response" };
  return { ok: true, text };
}

function extractJson(text: string): unknown {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fence?.[1] ?? text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("No JSON object in response");
  return JSON.parse(raw.slice(start, end + 1));
}

const FACTS_RULE = `Never invent employers, dates, degrees, tools, or metrics that are not in the source. You may rephrase, reorder, tighten, and emphasize. If a job-description skill is not evidenced, list it under missing — do not fabricate. Return JSON only.`;

export const parseResumeAi = createServerFn({ method: "POST" })
  .validator((input: { text: string }) => input)
  .handler(async ({ data }): Promise<Result<{ resume: Resume }>> => {
    const clipped = data.text.slice(0, 14000);
    const out = await chat({
      maxTokens: 2200,
      system: `You convert messy resume text into structured JSON. ${FACTS_RULE}
Schema: {"identity":{"name","title","location","email","phone","website","linkedin"},"summary":string,"experience":[{"role","org","location","start","end","bullets":string[]}],"education":[{"school","degree","year","detail"}],"skills":string[],"extras":[{"label","items":string[]}]}`,
      user: clipped,
    });
    if (!out.ok) return out;
    try {
      return { ok: true, resume: normalizeResume(extractJson(out.text)) };
    } catch {
      return { ok: false, error: "Could not parse structured resume" };
    }
  });

export const tailorResumeAi = createServerFn({ method: "POST" })
  .validator((input: { resume: Resume; jobDescription: string }) => input)
  .handler(
    async ({ data }): Promise<Result<{ resume: Resume; notes: TailorNotes }>> => {
      const out = await chat({
        maxTokens: 2800,
        system: `You tailor a resume JSON to a job description. Keep every fact honest. Prefer the posting's vocabulary when it is already evidenced. Reorder jobs and bullets by relevance. Rewrite bullets to be specific and quantified only if the numbers exist in the source. ${FACTS_RULE}
Schema: {"resume": <same resume shape>, "notes": {"summary": string, "moved": string[], "rewrote": string[], "missing": string[]}}`,
        user: JSON.stringify({
          resume: data.resume,
          jobDescription: data.jobDescription.slice(0, 8000),
        }),
      });
      if (!out.ok) return out;
      try {
        const json = extractJson(out.text) as {
          resume?: unknown;
          notes?: Partial<TailorNotes>;
        };
        return {
          ok: true,
          resume: normalizeResume(json.resume ?? json),
          notes: {
            summary: json.notes?.summary ?? "Tailored to the posting from your facts.",
            moved: json.notes?.moved ?? [],
            rewrote: json.notes?.rewrote ?? [],
            missing: json.notes?.missing ?? [],
          },
        };
      } catch {
        return { ok: false, error: "Could not parse tailored resume" };
      }
    },
  );

export const writeCoverLetterAi = createServerFn({ method: "POST" })
  .validator(
    (input: {
      resume: Resume;
      jobDescription: string;
      company: string;
      role: string;
    }) => input,
  )
  .handler(async ({ data }): Promise<Result<{ letter: CoverLetter }>> => {
    const out = await chat({
      maxTokens: 1200,
      system: `Write a one-page cover letter in a calm, specific voice. No clichés ("passionate", "excited to leverage", "dynamic"). Ground every claim in the resume. ${FACTS_RULE}
Schema: {"company","role","greeting","paragraphs":string[],"closing","signoff"}`,
      user: JSON.stringify({
        resume: data.resume,
        jobDescription: data.jobDescription.slice(0, 6000),
        company: data.company,
        role: data.role,
      }),
    });
    if (!out.ok) return out;
    try {
      return {
        ok: true,
        letter: normalizeLetter(extractJson(out.text), {
          ...emptyLetter(),
          company: data.company,
          role: data.role,
        }),
      };
    } catch {
      return { ok: false, error: "Could not parse cover letter" };
    }
  });

export const rewriteBulletAi = createServerFn({ method: "POST" })
  .validator(
    (input: { bullet: string; context: string; jobDescription?: string }) => input,
  )
  .handler(async ({ data }): Promise<Result<{ variants: string[] }>> => {
    const out = await chat({
      maxTokens: 400,
      system: `Rewrite ONE resume bullet three ways. Keep facts. Prefer verb + object + outcome. ${FACTS_RULE}
Schema: {"variants":[string,string,string]}`,
      user: JSON.stringify({
        bullet: data.bullet.slice(0, 500),
        context: data.context.slice(0, 1200),
        jobDescription: (data.jobDescription ?? "").slice(0, 2000),
      }),
    });
    if (!out.ok) return out;
    try {
      const json = extractJson(out.text) as { variants?: string[] };
      const variants = (json.variants ?? []).map((v) => v.trim()).filter(Boolean);
      if (!variants.length) return { ok: false, error: "No variants returned" };
      return { ok: true, variants: variants.slice(0, 3) };
    } catch {
      return { ok: false, error: "Could not parse variants" };
    }
  });

export const writeSummaryAi = createServerFn({ method: "POST" })
  .validator((input: { resume: Resume; jobDescription?: string }) => input)
  .handler(async ({ data }): Promise<Result<{ summary: string }>> => {
    const out = await chat({
      maxTokens: 350,
      system: `Write a 2–3 sentence professional summary from the resume. No clichés. ${FACTS_RULE}
Schema: {"summary": string}`,
      user: JSON.stringify({
        resume: data.resume,
        jobDescription: (data.jobDescription ?? "").slice(0, 3000),
      }),
    });
    if (!out.ok) return out;
    try {
      const json = extractJson(out.text) as { summary?: string };
      if (!json.summary) return { ok: false, error: "Empty summary" };
      return { ok: true, summary: json.summary.trim() };
    } catch {
      return { ok: false, error: "Could not parse summary" };
    }
  });

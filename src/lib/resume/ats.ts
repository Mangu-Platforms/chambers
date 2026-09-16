import type { AtsReport, Resume } from "./types";
import { actionVerb, hasMetric, resumePlainText, uniqueKeywords } from "./text";

export function scoreAts(resume: Resume, jobDescription: string): AtsReport {
  const resumeText = resumePlainText(resume).toLowerCase();
  const keywords = uniqueKeywords(jobDescription);
  const matched: string[] = [];
  const missing: string[] = [];
  for (const k of keywords) {
    if (resumeText.includes(k.toLowerCase())) matched.push(k);
    else missing.push(k);
  }
  const extras = resume.skills.filter(
    (s) => !keywords.some((k) => k.toLowerCase() === s.toLowerCase()),
  );

  const bullets = resume.experience.flatMap((j) => j.bullets).filter(Boolean);
  const withVerb = bullets.filter(actionVerb).length;
  const withMetric = bullets.filter(hasMetric).length;
  const contactBits = [
    resume.identity.email,
    resume.identity.location,
    resume.identity.phone || resume.identity.website || resume.identity.linkedin,
  ].filter(Boolean).length;

  const checks: AtsReport["checks"] = [
    {
      id: "contact",
      label: "Parseable contact",
      pass: contactBits >= 2 && Boolean(resume.identity.email),
      detail: resume.identity.email
        ? "Email plus location or a second channel."
        : "Add an email address so ATS and recruiters can reach you.",
    },
    {
      id: "summary",
      label: "Professional summary",
      pass: resume.summary.trim().length >= 80,
      detail:
        resume.summary.trim().length >= 80
          ? "Lead paragraph is long enough to carry keywords."
          : "Write 2–3 sentences so the parser has a place for the role.",
    },
    {
      id: "verbs",
      label: "Action-led bullets",
      pass: bullets.length > 0 && withVerb / bullets.length >= 0.6,
      detail: `${withVerb}/${bullets.length || 0} bullets start with a verb.`,
    },
    {
      id: "metrics",
      label: "Evidence in numbers",
      pass: bullets.length > 0 && withMetric / bullets.length >= 0.3,
      detail: `${withMetric}/${bullets.length || 0} bullets include a figure.`,
    },
    {
      id: "length",
      label: "One-to-two pages",
      pass: bullets.length >= 6 && bullets.length <= 18,
      detail:
        bullets.length < 6
          ? "Thin — add proof, not adjectives."
          : bullets.length > 18
            ? "Long — trim to the jobs that match this posting."
            : "Density is in the sweet spot for letter paper.",
    },
    {
      id: "skills",
      label: "Skills the parser can list",
      pass: resume.skills.length >= 6,
      detail:
        resume.skills.length >= 6
          ? `${resume.skills.length} skills, plain text.`
          : "Add a flat skills list — parsers love it more than prose.",
    },
  ];

  const checkScore = Math.round((checks.filter((c) => c.pass).length / checks.length) * 40);
  const cover = keywords.length === 0 ? 50 : Math.round((matched.length / keywords.length) * 60);
  const score = Math.max(12, Math.min(99, checkScore + cover));

  return { score, matched, missing, extras, checks };
}

export function scoreLabel(score: number): string {
  if (score >= 85) return "Interview-ready";
  if (score >= 70) return "Strong match";
  if (score >= 55) return "Close — tailor it";
  return "Rewrite against the posting";
}

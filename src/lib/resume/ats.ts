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

  const jobs = resume.experience;
  const bullets = jobs.flatMap((j) => j.bullets).filter((b) => b.trim());
  const withVerb = bullets.filter(actionVerb).length;
  const withMetric = bullets.filter(hasMetric).length;
  const contactBits = [
    resume.identity.email,
    resume.identity.location,
    resume.identity.phone || resume.identity.website || resume.identity.linkedin,
  ].filter(Boolean).length;
  const dated = jobs.filter((j) => j.start.trim()).length;
  const hasEdu = resume.education.some((e) => e.school.trim() || e.degree.trim());
  const coverRatio = keywords.length === 0 ? 1 : matched.length / keywords.length;

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
      pass: resume.skills.filter(Boolean).length >= 6,
      detail:
        resume.skills.filter(Boolean).length >= 6
          ? `${resume.skills.filter(Boolean).length} skills, plain text.`
          : "Add a flat skills list — parsers love it more than prose.",
    },
    {
      id: "dates",
      label: "Dated roles",
      pass: jobs.length === 0 || dated / jobs.length >= 0.8,
      detail:
        jobs.length === 0
          ? "Add at least one role with dates."
          : `${dated}/${jobs.length} roles have a start date.`,
    },
    {
      id: "education",
      label: "Education listed",
      pass: hasEdu,
      detail: hasEdu ? "School or degree is parseable." : "Add a school or degree line.",
    },
    {
      id: "keywords",
      label: "Posting phrases",
      pass: keywords.length === 0 || coverRatio >= 0.4,
      detail:
        keywords.length === 0
          ? "Paste a posting to score phrase overlap."
          : `${matched.length}/${keywords.length} posting phrases already in the sheet.`,
    },
  ];

  const checkScore = Math.round(
    (checks.filter((c) => c.pass).length / checks.length) * 40,
  );
  const cover =
    keywords.length === 0 ? 50 : Math.round((matched.length / keywords.length) * 60);
  const score = Math.max(12, Math.min(99, checkScore + cover));

  return { score, matched, missing, extras, checks };
}

export function scoreLabel(score: number): string {
  if (score >= 85) return "Interview-ready";
  if (score >= 70) return "Strong match";
  if (score >= 55) return "Close — tailor it";
  return "Rewrite against the posting";
}

export function reportAsText(report: AtsReport, name?: string): string {
  const lines = [
    name ? `ATS check — ${name}` : "ATS check",
    `Score ${report.score} · ${scoreLabel(report.score)}`,
    "",
    "Checks",
    ...report.checks.map((c) => `- ${c.pass ? "ok" : "open"} ${c.label}. ${c.detail}`),
  ];
  if (report.matched.length) {
    lines.push("", `Present: ${report.matched.slice(0, 16).join(", ")}`);
  }
  if (report.missing.length) {
    lines.push(`Not evidenced (do not invent): ${report.missing.slice(0, 16).join(", ")}`);
  }
  return lines.join("\n").trim() + "\n";
}


import type { Resume, TailorNotes } from "./types";
import { cloneResume } from "./normalize";
import { tokenize, uniqueKeywords } from "./text";

const WEAK = /^(responsible for|worked on|helped with|helped|assisted with|assisted in|tasked with)\s+/i;

export function tailorLocal(
  resume: Resume,
  jobDescription: string,
): {
  resume: Resume;
  notes: TailorNotes;
} {
  const next = cloneResume(resume);
  const keywords = uniqueKeywords(jobDescription);
  const jdTokens = new Set(tokenize(jobDescription));

  const overlap = (text: string) =>
    tokenize(text).reduce((n, t) => n + (jdTokens.has(t) ? 1 : 0), 0);

  const moved: string[] = [];
  const rewrote: string[] = [];

  const rankedJobs = [...next.experience].sort((a, b) => {
    const sa = overlap([a.role, a.org, ...a.bullets].join(" "));
    const sb = overlap([b.role, b.org, ...b.bullets].join(" "));
    return sb - sa;
  });
  if (rankedJobs[0] && rankedJobs[0].id !== next.experience[0]?.id) {
    moved.push(`Led with ${rankedJobs[0].role} at ${rankedJobs[0].org} — closest to this posting.`);
  }
  for (const job of rankedJobs) {
    const original = job.bullets.slice();
    job.bullets = [...job.bullets].sort((a, b) => overlap(b) - overlap(a));
    if (job.bullets[0] && job.bullets[0] !== original[0]) {
      moved.push(`Raised a matching bullet under ${job.role}.`);
    }
    job.bullets = job.bullets.map((b) => {
      if (!WEAK.test(b)) return b;
      const nextBullet = b.replace(WEAK, "Led ");
      if (nextBullet !== b) rewrote.push(`Tightened a weak opener under ${job.role}.`);
      return nextBullet;
    });
  }
  next.experience = rankedJobs;

  const skillRanked = [...next.skills].sort((a, b) => overlap(b) - overlap(a));
  if (skillRanked.join() !== next.skills.join()) {
    moved.push("Reordered skills so the posting’s language comes first.");
  }
  next.skills = skillRanked;

  const missing = keywords.filter((k) => !resumePlain(next).includes(k.toLowerCase()));

  return {
    resume: next,
    notes: {
      summary:
        missing.length > 4
          ? "Reordered your real experience toward this posting. Several required phrases still aren’t evidenced — don’t invent them."
          : "Reordered your real experience toward this posting. Coverage is already strong.",
      moved: [...new Set(moved)],
      rewrote: [...new Set(rewrote)],
      missing: missing.slice(0, 12),
    },
  };
}

function resumePlain(resume: Resume): string {
  return [
    resume.summary,
    ...resume.experience.flatMap((j) => [j.role, j.org, ...j.bullets]),
    ...resume.skills,
  ]
    .join("\n")
    .toLowerCase();
}

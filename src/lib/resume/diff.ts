import type { Resume } from "./types";

export type BulletChange = {
  kind: "raised" | "rewritten" | "same";
  role: string;
  text: string;
};

export function diffResumes(before: Resume, after: Resume): {
  jobOrder: { before: string[]; after: string[] };
  bullets: BulletChange[];
  skills: { before: string[]; after: string[] };
} {
  const beforeJobs = before.experience.map((j) => j.role || j.org);
  const afterJobs = after.experience.map((j) => j.role || j.org);
  const byId = new Map(before.experience.map((j) => [j.id, j]));
  const bullets: BulletChange[] = [];
  for (const job of after.experience) {
    const prev = byId.get(job.id);
    if (!prev) {
      for (const b of job.bullets.filter(Boolean)) {
        bullets.push({ kind: "raised", role: job.role, text: b });
      }
      continue;
    }
    const prevFirst = prev.bullets[0];
    job.bullets.filter(Boolean).forEach((b, i) => {
      if (i === 0 && prevFirst && b !== prevFirst && prev.bullets.includes(b)) {
        bullets.push({ kind: "raised", role: job.role, text: b });
      } else if (!prev.bullets.includes(b)) {
        bullets.push({ kind: "rewritten", role: job.role, text: b });
      }
    });
  }
  return {
    jobOrder: { before: beforeJobs, after: afterJobs },
    bullets: bullets.slice(0, 12),
    skills: { before: before.skills, after: after.skills },
  };
}

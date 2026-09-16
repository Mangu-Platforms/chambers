import type { Resume } from "./types";
import { resumePlainText, uniqueKeywords } from "./text";

export function writeSummaryLocal(resume: Resume, jobDescription = ""): string {
  const title =
    resume.identity.title.split("·")[0]?.trim() || resume.experience[0]?.role || "Professional";
  const proof = resume.experience[0]?.bullets[0];
  const skills = resume.skills.filter(Boolean).slice(0, 4).join(", ");
  const hay = resumePlainText(resume).toLowerCase();
  const kws = uniqueKeywords(jobDescription)
    .filter((k) => hay.includes(k.toLowerCase()))
    .slice(0, 3);

  let s = `${title} with a record of ${
    proof
      ? proof.trim().replace(/\.$/, "").replace(/^[A-Z]/, (c) => c.toLowerCase())
      : "shipping work other people can trust"
  }.`;
  if (skills) s += ` Tools in daily use: ${skills}.`;
  if (kws.length) s += ` The posting’s ${kws.join(", ")} already show up in shipped work.`;
  return s;
}

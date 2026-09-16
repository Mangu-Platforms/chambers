import type { CoverLetter, Resume } from "./types";
import { inferCompany, inferRole } from "./infer";
import { uniqueKeywords } from "./text";

export function writeLetterLocal(
  resume: Resume,
  jobDescription: string,
  company: string,
  role: string,
): CoverLetter {
  const name = resume.identity.name || "the candidate";
  const first = name.split(" ")[0] ?? name;
  const title =
    resume.identity.title.split("·")[0]?.trim() || resume.experience[0]?.role || "the work";
  const job = resume.experience[0];
  const proof = job?.bullets[0] ?? resume.summary;
  const keywords = uniqueKeywords(jobDescription).slice(0, 4);
  const keywordLine = keywords.length
    ? `I’m especially aligned with ${keywords.slice(0, 3).join(", ")} — all present in work I’ve already shipped, not invented for this letter.`
    : `I’m writing because the posting matches the kind of systems work I already do.`;

  const companyName = company || inferCompany(jobDescription) || "your team";
  const roleName = role || inferRole(jobDescription) || "this role";

  return {
    company: companyName,
    role: roleName,
    greeting: `Hiring team at ${companyName}`,
    paragraphs: [
      `I’m ${name}, ${indefinite(title)}. I’m applying for the ${roleName} role at ${companyName} because the posting describes work I have already been doing — not work I would like to imagine.`,
      proof
        ? `Most recently, ${lcFirst(proof)} That is the standard I would bring to ${companyName}.`
        : `My recent work has been about shipping systems other people can trust — and keeping the voice of the work intact.`,
      keywordLine,
    ],
    closing: `I’d welcome a conversation about how this work shows up on your team. Thank you for reading.`,
    signoff: `Sincerely,\n${first}`,
  };
}

function lcFirst(s: string): string {
  const t = s.trim().replace(/\.$/, "");
  return t.charAt(0).toLowerCase() + t.slice(1) + (s.trim().endsWith(".") ? "." : ".");
}

function indefinite(word: string): string {
  const w = word.trim();
  if (!w) return "a practitioner";
  return /^[aeiou]/i.test(w) ? `an ${w.toLowerCase()}` : `a ${w.toLowerCase()}`;
}

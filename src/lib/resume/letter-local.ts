import type { CoverLetter, LetterTone, Resume } from "./types";
import { inferCompany, inferRole } from "./infer";
import { uniqueKeywords } from "./text";

export function writeLetterLocal(
  resume: Resume,
  jobDescription: string,
  company: string,
  role: string,
  tone: LetterTone = "calm",
): CoverLetter {
  const name = resume.identity.name || "the candidate";
  const first = name.split(" ")[0] ?? name;
  const title =
    resume.identity.title.split("·")[0]?.trim() || resume.experience[0]?.role || "the work";
  const job = resume.experience[0];
  const proof = job?.bullets[0] ?? resume.summary;
  const hay = [
    resume.summary,
    ...resume.experience.flatMap((j) => [j.role, j.org, ...j.bullets]),
    ...resume.skills,
  ]
    .join(" ")
    .toLowerCase();
  const keywords = uniqueKeywords(jobDescription)
    .filter((k) => hay.includes(k.toLowerCase()))
    .slice(0, 4);

  const companyName = company || inferCompany(jobDescription) || "your team";
  const roleName = role || inferRole(jobDescription) || "this role";

  const keywordLine = keywords.length
    ? tone === "direct"
      ? `${keywords.slice(0, 3).join(", ")} already show up in shipped work — not invented for this letter.`
      : tone === "warm"
        ? `I noticed the posting asks for ${keywords.slice(0, 3).join(", ")}. Those are already in the work I do.`
        : `The posting asks for ${keywords.slice(0, 3).join(", ")} — all already present in work I have shipped, not invented for this letter.`
    : tone === "direct"
      ? `The posting matches work I already do. I am not stretching for it.`
      : `I’m writing because the posting matches the kind of work I already do.`;

  const open =
    tone === "direct"
      ? `${name}. ${capitalize(indefinite(title))}. Applying for ${roleName} at ${companyName} because the posting describes work I have already shipped.`
      : tone === "warm"
        ? `I’m ${name}, ${indefinite(title)}. I’m writing about the ${roleName} role at ${companyName} — it reads like the work I already care about doing well.`
        : `I’m ${name}, ${indefinite(title)}. I’m applying for the ${roleName} role at ${companyName} because the posting describes work I have already been doing — not work I would like to imagine.`;

  const middle = proof
    ? tone === "direct"
      ? `Most recently: ${lcFirst(proof)} That is the bar I would hold at ${companyName}.`
      : `Most recently, ${lcFirst(proof)} That is the standard I would bring to ${companyName}.`
    : `My recent work has been about shipping systems other people can trust, and keeping the voice of the work intact.`;

  const closing =
    tone === "direct"
      ? `Happy to walk through the work. Thank you for reading.`
      : tone === "warm"
        ? `I’d be glad to talk about how this work could show up on your team. Thank you for your time.`
        : `I’d welcome a conversation about how this work shows up on your team. Thank you for reading.`;

  return {
    company: companyName,
    role: roleName,
    greeting: tone === "warm" ? `${companyName} team` : `Hiring team at ${companyName}`,
    paragraphs: [open, middle, keywordLine],
    closing,
    signoff: `Sincerely,\n${first}`,
  };
}

function lcFirst(s: string): string {
  const t = s.trim().replace(/\.$/, "");
  return t.charAt(0).toLowerCase() + t.slice(1) + (s.trim().endsWith(".") ? "." : ".");
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function indefinite(word: string): string {
  const w = word.trim();
  if (!w) return "a practitioner";
  return /^[aeiou]/i.test(w) ? `an ${w.toLowerCase()}` : `a ${w.toLowerCase()}`;
}

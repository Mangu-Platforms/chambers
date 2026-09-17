import { memo } from "react";
import type { CoverLetter, Resume } from "@/lib/resume/types";

function today(): string {
  try {
    return new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export const LetterSheet = memo(function LetterSheet({
  letter,
  resume,
}: {
  letter: CoverLetter;
  resume: Resume;
}) {
  const name = resume.identity.name || "Your name";
  const paras =
    letter.paragraphs.length > 0
      ? letter.paragraphs
      : [
          "Paste a job description and generate a letter. It will stay on this paper, in your voice.",
        ];
  const date = today();

  return (
    <article className="print-sheet letter-sheet w-full text-ink">
      <header>
        <h1 className="font-display m-0 text-[32px] font-semibold leading-[1.05] tracking-[-0.035em]">
          {name}
        </h1>
        <p className="mt-2 mb-0 text-[15px] text-soft">{resume.identity.title}</p>
        <div className="mt-3 mb-5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-soft">
          {[resume.identity.location, resume.identity.email, resume.identity.phone]
            .filter(Boolean)
            .map((c) => (
              <span key={c}>{c}</span>
            ))}
        </div>
        {date ? <p className="mb-5 text-[13px] text-soft">{date}</p> : null}
        <hr className="mb-7 mt-0 h-px border-0 bg-rule" />
      </header>
      {(letter.role || letter.company) && (
        <p className="mb-6 text-[15px] text-soft">
          {letter.role ? <span className="font-medium text-ink">{letter.role}</span> : null}
          {letter.role && letter.company ? " · " : null}
          {letter.company}
        </p>
      )}
      <p className="mb-5 text-[15px]">Dear {letter.greeting || "Hiring team"},</p>
      {paras.map((p) => (
        <p key={p.slice(0, 40)} className="mb-5 text-[15px] leading-[1.55] tracking-[-0.011em]">
          {p}
        </p>
      ))}
      <p className="mb-1 text-[15px]">{letter.closing || "Thank you for your time."}</p>
      <p className="mt-8 mb-0 text-[15px] whitespace-pre-line">
        {(letter.signoff || "Sincerely").split("\n")[0].replace(/,$/, "")},
      </p>
      <p className="mt-6 mb-0 text-[15px] font-medium">{name}</p>
    </article>
  );
});

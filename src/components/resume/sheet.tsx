import { memo, type ReactNode } from "react";
import type { Resume, TemplateId } from "@/lib/resume/types";
import { cn } from "@/lib/cn";

function contactBits(r: Resume): string[] {
  const i = r.identity;
  return [i.location, i.email, i.phone, i.website, i.linkedin].map((s) => s.trim()).filter(Boolean);
}

function SectionLabel({ children, ink }: { children: ReactNode; ink?: boolean }) {
  return (
    <h2
      className={cn(
        "resume-h2 mb-3.5 text-[11px] font-semibold uppercase tracking-[0.16em]",
        ink ? "text-ink" : "text-ember",
      )}
    >
      {children}
    </h2>
  );
}

function Jobs({ resume, compact }: { resume: Resume; compact?: boolean }) {
  return (
    <div className={cn("flex flex-col", compact ? "gap-3.5" : "gap-[22px]")}>
      {resume.experience.map((job) => (
        <div key={job.id} className="job">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className={cn("m-0 font-semibold tracking-[-0.02em]", compact ? "text-[13.5px]" : "text-[15px]")}>
              {compact ? [job.role, job.org].filter(Boolean).join(" · ") : job.role}
            </h3>
            {(job.start || job.end) && (
              <span className="shrink-0 whitespace-nowrap text-xs text-soft tabular-nums">
                {job.start}
                {job.start && job.end ? " — " : ""}
                {job.end}
              </span>
            )}
          </div>
          {!compact && (
            <div className="mt-0.5 text-xs text-soft">{[job.org, job.location].filter(Boolean).join(" · ")}</div>
          )}
          {job.bullets.length > 0 && (
            <ul className="mt-2 mb-0 list-disc pl-[1.1em]">
              {job.bullets.map((b, i) => (
                <li
                  key={`${job.id}-${i}`}
                  className={cn("mb-1 tracking-[-0.011em]", compact ? "text-[13px] leading-[1.4]" : "text-[15px] leading-[1.47]")}
                >
                  {b}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

function SkillsChips({ skills }: { skills: string[] }) {
  const list = skills.filter(Boolean);
  if (!list.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {list.map((s) => (
        <span key={s} className="inline-flex h-7 items-center rounded-pill border border-hair px-2.5 text-[11px]">
          {s}
        </span>
      ))}
    </div>
  );
}

export const ResumeSheet = memo(function ResumeSheet({
  resume,
  template,
  className,
}: {
  resume: Resume;
  template: TemplateId;
  className?: string;
}) {
  const name = resume.identity.name || "Your name";
  const contact = contactBits(resume);
  const classic = template === "classic";
  const compact = template === "compact";
  const editorial = template === "editorial";

  return (
    <article
      data-template={template}
      className={cn("print-sheet sheet-root w-full max-w-resume bg-paper text-ink shadow-chambers", className)}
    >
      {template === "executive" && (
        <header className="exec-band bg-night px-12 py-8 text-cream">
          <h1 className="font-display text-[40px] font-semibold leading-[1.05] tracking-[-0.035em]">{name}</h1>
          {resume.identity.title ? (
            <p className="mt-2 text-[17px] tracking-[-0.011em] text-faint">{resume.identity.title}</p>
          ) : null}
          {contact.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-faint">
              {contact.map((c) => (
                <span key={c}>{c}</span>
              ))}
            </div>
          )}
        </header>
      )}

      {template === "sidebar" ? (
        <div className="sheet-pad grid grid-cols-1 gap-8 md:grid-cols-[200px_1fr] print:grid-cols-[200px_1fr]">
          <aside className="sidebar-rail rounded-md border border-hair bg-cream p-[22px_18px]">
            {contact.length > 0 && (
              <>
                <SectionLabel>Contact</SectionLabel>
                <ul className="mb-6 list-none p-0 text-[12px] leading-[1.55]">
                  {contact.map((c) => (
                    <li key={c} className="mb-1">
                      {c}
                    </li>
                  ))}
                </ul>
              </>
            )}
            {resume.skills.length > 0 && (
              <>
                <SectionLabel>Tools</SectionLabel>
                <SkillsChips skills={resume.skills} />
              </>
            )}
            {resume.education.map((ed) => (
              <div key={ed.id} className="mt-6">
                <SectionLabel>Education</SectionLabel>
                <div className="text-[15px] font-semibold tracking-[-0.02em]">{ed.degree}</div>
                <div className="text-xs text-soft">{[ed.school, ed.year].filter(Boolean).join(" · ")}</div>
              </div>
            ))}
          </aside>
          <div>
            <h1 className="font-display m-0 text-[36px] font-semibold leading-[1.05] tracking-[-0.035em]">{name}</h1>
            {resume.identity.title ? <p className="mt-2 mb-6 text-[17px] text-soft">{resume.identity.title}</p> : null}
            {resume.experience.length > 0 && (
              <>
                <SectionLabel>Selected work</SectionLabel>
                <Jobs resume={resume} />
              </>
            )}
            {resume.extras.map((x) => (
              <div key={x.id} className="mt-7">
                <SectionLabel>{x.label}</SectionLabel>
                <ul className="mb-0 list-disc pl-[1.1em]">
                  {x.items.filter(Boolean).map((it) => (
                    <li key={it} className="mb-1 text-[15px] leading-[1.47]">
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={cn("sheet-pad", template === "executive" && "pt-8")}>
          {template !== "executive" && (
            <>
              <h1
                className={cn(
                  "m-0 font-semibold leading-[1.05]",
                  editorial && "font-serif text-[48px] font-medium tracking-[-0.04em]",
                  classic && "text-center text-[28px] uppercase tracking-[0.14em]",
                  compact && "text-[26px] tracking-[-0.03em]",
                  !editorial && !classic && !compact && "font-display text-[42px] tracking-[-0.035em]",
                )}
              >
                {name}
              </h1>
              {resume.identity.title ? (
                <p
                  className={cn(
                    "mt-2 mb-0 tracking-[-0.011em] text-soft",
                    editorial && "font-serif italic text-[18px]",
                    classic && "text-center text-[15px]",
                    compact && "text-[14px]",
                    !editorial && !classic && !compact && "text-[17px]",
                  )}
                >
                  {resume.identity.title}
                </p>
              ) : null}
              {contact.length > 0 && (
                <div
                  className={cn(
                    "mt-4 mb-7 flex flex-wrap gap-x-[18px] gap-y-2 text-xs text-soft",
                    classic && "justify-center",
                  )}
                >
                  {contact.map((c) => (
                    <span key={c}>{c}</span>
                  ))}
                </div>
              )}
              {classic ? (
                <div className="mx-auto mb-7 space-y-px">
                  <div className="h-px w-full bg-ink/25" />
                  <div className="h-px w-full bg-ink/10" />
                </div>
              ) : (
                <hr className={cn("mb-7 mt-0 h-px border-0", compact ? "bg-ink/15" : "bg-rule")} />
              )}
            </>
          )}

          {resume.summary && !compact && (
            <>
              <SectionLabel ink={classic}>{classic ? "Profile" : "Summary"}</SectionLabel>
              <p className="mb-7 text-[15px] leading-[1.47] tracking-[-0.011em]">{resume.summary}</p>
            </>
          )}
          {resume.summary && compact && (
            <p className="mb-5 text-[13.5px] leading-[1.45]">{resume.summary}</p>
          )}
          {resume.experience.length > 0 && (
            <>
              <SectionLabel ink={classic}>{classic || compact ? "Experience" : "Selected work"}</SectionLabel>
              <Jobs resume={resume} compact={compact} />
            </>
          )}
          <hr className="my-7 h-px border-0 bg-hair" />
          <div className={cn("grid gap-8", compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-[1.4fr_1fr] print:grid-cols-[1.4fr_1fr]")}>
            <div>
              <SectionLabel ink={classic}>Education</SectionLabel>
              {resume.education.map((ed) => (
                <div key={ed.id} className="mb-3">
                  <div className="text-[15px] font-semibold tracking-[-0.02em]">{ed.degree}</div>
                  <div className="text-xs text-soft">{[ed.school, ed.year].filter(Boolean).join(" · ")}</div>
                  {ed.detail ? <p className="mt-1 mb-0 text-xs text-soft">{ed.detail}</p> : null}
                </div>
              ))}
            </div>
            <div>
              <SectionLabel ink={classic}>{editorial ? "Tools" : "Skills"}</SectionLabel>
              {editorial || compact || classic ? (
                <p className="m-0 text-[15px] leading-[1.47]">{resume.skills.filter(Boolean).join(" · ")}</p>
              ) : (
                <SkillsChips skills={resume.skills} />
              )}
            </div>
          </div>
          {resume.extras.map((x) => (
            <div key={x.id} className="mt-7">
              <SectionLabel ink={classic}>{x.label}</SectionLabel>
              <ul className="mb-0 list-disc pl-[1.1em]">
                {x.items.filter(Boolean).map((it) => (
                  <li key={it} className="mb-1 text-[15px] leading-[1.47]">
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </article>
  );
});

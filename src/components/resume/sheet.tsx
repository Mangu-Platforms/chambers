import { memo, type ReactNode } from "react";
import { Mark } from "@/components/resume/mark";
import type { Density, Resume, TemplateId } from "@/lib/resume/types";
import { cn } from "@/lib/cn";

function contactBits(r: Resume): string[] {
  const i = r.identity;
  return [i.location, i.email, i.phone, i.website, i.linkedin].map((s) => s.trim()).filter(Boolean);
}

function SectionLabel({
  children,
  tone = "ember",
  align = "left",
}: {
  children: ReactNode;
  tone?: "ember" | "ink";
  align?: "left" | "center";
}) {
  return (
    <h2
      className={cn(
        "resume-h2 mb-3.5 text-[11px] font-semibold uppercase tracking-[0.16em]",
        tone === "ember" ? "text-ember" : "text-ink",
        align === "center" && "text-center",
      )}
    >
      {children}
    </h2>
  );
}

function Jobs({ resume, variant = "letter" }: { resume: Resume; variant?: "letter" | "compact" | "classic" }) {
  return (
    <div className={cn("flex flex-col", variant === "compact" ? "gap-3.5" : "gap-[22px]")}>
      {resume.experience.map((job) => (
        <div key={job.id} className="job">
          {variant === "compact" ? (
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="m-0 text-[13.5px] font-semibold tracking-[-0.02em]">
                {[job.role, job.org].filter(Boolean).join(" · ")}
              </h3>
              {(job.start || job.end) && (
                <span className="shrink-0 whitespace-nowrap text-xs text-soft tabular-nums">
                  {job.start}
                  {job.start && job.end ? " — " : ""}
                  {job.end}
                </span>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="m-0 text-[15px] font-semibold tracking-[-0.02em]">{job.role}</h3>
                {(job.start || job.end) && (
                  <span className="shrink-0 whitespace-nowrap text-xs text-soft tabular-nums">
                    {job.start}
                    {job.start && job.end ? " — " : ""}
                    {job.end}
                  </span>
                )}
              </div>
              <div className={cn("mt-0.5 text-xs text-soft", variant === "classic" && "italic")}>
                {[job.org, job.location].filter(Boolean).join(" · ")}
              </div>
            </>
          )}
          {job.bullets.filter(Boolean).length > 0 && (
            <ul className={cn("mb-0 list-disc pl-[1.1em]", variant === "compact" ? "mt-1" : "mt-2")}>
              {job.bullets.filter(Boolean).map((b, i) => (
                <li
                  key={`${job.id}-${i}`}
                  className={cn(
                    "mb-1 tracking-[-0.011em]",
                    variant === "compact" ? "text-[13px] leading-[1.4]" : "text-[15px] leading-[1.47]",
                  )}
                >
                  <Mark text={b} />
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
        <span
          key={s}
          className="inline-flex h-7 items-center rounded-pill border border-hair px-2.5 text-[11px]"
        >
          <Mark text={s} />
        </span>
      ))}
    </div>
  );
}

function EducationBlock({ resume, dense }: { resume: Resume; dense?: boolean }) {
  if (resume.education.length === 0) {
    return <p className="text-xs text-soft">Add education in the editor.</p>;
  }
  return (
    <>
      {resume.education.map((ed) => (
        <div key={ed.id} className={dense ? "mb-2" : "mb-3"}>
          <div className={cn("font-semibold tracking-[-0.02em]", dense ? "text-[13.5px]" : "text-[15px]")}>
            {ed.degree}
          </div>
          <div className="text-xs text-soft">{[ed.school, ed.year].filter(Boolean).join(" · ")}</div>
          {ed.detail ? <p className="mt-1 mb-0 text-xs text-soft">{ed.detail}</p> : null}
        </div>
      ))}
    </>
  );
}

function Extras({ resume, dense }: { resume: Resume; dense?: boolean }) {
  return (
    <>
      {resume.extras.map((x) => (
        <div key={x.id} className={dense ? "mt-4" : "mt-7"}>
          <SectionLabel>{x.label}</SectionLabel>
          <ul className="mb-0 list-disc pl-[1.1em]">
            {x.items.filter(Boolean).map((it) => (
              <li key={it} className={cn("mb-1 leading-[1.47]", dense ? "text-[13px]" : "text-[15px]")}>
                <Mark text={it} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}

function LetterBody({ resume }: { resume: Resume }) {
  return (
    <>
      {resume.summary ? (
        <>
          <SectionLabel>Summary</SectionLabel>
          <p className="mb-7 text-[15px] leading-[1.47] tracking-[-0.011em]">
            <Mark text={resume.summary} />
          </p>
        </>
      ) : null}
      {resume.experience.length > 0 && (
        <>
          <SectionLabel>Selected work</SectionLabel>
          <Jobs resume={resume} />
        </>
      )}
      <hr className="my-7 h-px border-0 bg-hair" />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.4fr_1fr] print:grid-cols-[1.4fr_1fr]">
        <div>
          <SectionLabel>Education</SectionLabel>
          <EducationBlock resume={resume} />
        </div>
        <div>
          <SectionLabel>Skills</SectionLabel>
          <SkillsChips skills={resume.skills} />
        </div>
      </div>
      <Extras resume={resume} />
    </>
  );
}

function CompactBody({ resume }: { resume: Resume }) {
  return (
    <>
      {resume.summary ? (
        <p className="mb-4 text-[13px] leading-[1.42] text-ink">
          <Mark text={resume.summary} />
        </p>
      ) : null}
      {resume.experience.length > 0 && (
        <>
          <SectionLabel tone="ink">Experience</SectionLabel>
          <Jobs resume={resume} variant="compact" />
        </>
      )}
      <hr className="my-4 h-px border-0 bg-hair" />
      <div className="grid grid-cols-1 gap-4">
        <div>
          <SectionLabel tone="ink">Education</SectionLabel>
          <EducationBlock resume={resume} dense />
        </div>
        <div>
          <SectionLabel tone="ink">Skills</SectionLabel>
          <p className="m-0 text-[13px] leading-[1.45]">{resume.skills.filter(Boolean).join(" · ")}</p>
        </div>
      </div>
      <Extras resume={resume} dense />
    </>
  );
}

function EditorialBody({ resume }: { resume: Resume }) {
  return (
    <>
      {resume.summary ? (
        <>
          <SectionLabel>Profile</SectionLabel>
          <p className="font-serif mb-8 text-[17px] leading-[1.5] tracking-[-0.015em]">
            <Mark text={resume.summary} />
          </p>
        </>
      ) : null}
      {resume.experience.length > 0 && (
        <>
          <SectionLabel>Selected work</SectionLabel>
          <Jobs resume={resume} />
        </>
      )}
      <hr className="my-8 h-px border-0 bg-rule" />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.4fr_1fr] print:grid-cols-[1.4fr_1fr]">
        <div>
          <SectionLabel>Education</SectionLabel>
          <EducationBlock resume={resume} />
        </div>
        <div>
          <SectionLabel>Tools</SectionLabel>
          <p className="m-0 text-[15px] leading-[1.55]">{resume.skills.filter(Boolean).join(" · ")}</p>
        </div>
      </div>
      <Extras resume={resume} />
    </>
  );
}

function ClassicBody({ resume }: { resume: Resume }) {
  return (
    <>
      {resume.summary ? (
        <>
          <SectionLabel tone="ink" align="center">
            Summary
          </SectionLabel>
          <p className="mb-6 text-center text-[14px] leading-[1.5]">
            <Mark text={resume.summary} />
          </p>
        </>
      ) : null}
      {resume.experience.length > 0 && (
        <>
          <SectionLabel tone="ink" align="center">
            Experience
          </SectionLabel>
          <Jobs resume={resume} variant="classic" />
        </>
      )}
      <hr className="my-7 h-px border-0 bg-ink/15" />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 print:grid-cols-2">
        <div>
          <SectionLabel tone="ink" align="center">
            Education
          </SectionLabel>
          <EducationBlock resume={resume} />
        </div>
        <div>
          <SectionLabel tone="ink" align="center">
            Skills
          </SectionLabel>
          <p className="m-0 text-center text-[15px] leading-[1.47]">
            {resume.skills.filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>
      <Extras resume={resume} />
    </>
  );
}

function ExecutiveBody({ resume }: { resume: Resume }) {
  return (
    <>
      {resume.summary ? (
        <>
          <SectionLabel>Summary</SectionLabel>
          <p className="mb-7 text-[15px] leading-[1.47]">
            <Mark text={resume.summary} />
          </p>
        </>
      ) : null}
      {resume.experience.length > 0 && (
        <>
          <SectionLabel>Selected work</SectionLabel>
          <Jobs resume={resume} />
        </>
      )}
      <hr className="my-7 h-px border-0 bg-hair" />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.4fr_1fr] print:grid-cols-[1.4fr_1fr]">
        <div>
          <SectionLabel>Education</SectionLabel>
          <EducationBlock resume={resume} />
        </div>
        <div>
          <SectionLabel>Skills</SectionLabel>
          <SkillsChips skills={resume.skills} />
        </div>
      </div>
      <Extras resume={resume} />
    </>
  );
}

function SidebarBody({ resume }: { resume: Resume }) {
  const name = resume.identity.name || "Your name";
  const contact = contactBits(resume);
  return (
    <div className="sheet-pad grid grid-cols-1 gap-8 md:grid-cols-[200px_1fr] print:grid-cols-[200px_1fr]">
      <aside className="sidebar-rail rounded-md border border-hair bg-cream p-[22px_18px]">
        {contact.length > 0 ? (
          <>
            <SectionLabel>Contact</SectionLabel>
            <ul className="mb-6 list-none p-0 text-[12px] leading-[1.55]">
              {contact.map((c) => (
                <li key={c} className="mb-1.5 break-all">
                  {c}
                </li>
              ))}
            </ul>
          </>
        ) : null}
        {resume.skills.length > 0 && (
          <>
            <SectionLabel>Tools</SectionLabel>
            <ul className="mb-0 list-none p-0">
              {resume.skills.filter(Boolean).map((s) => (
                <li key={s} className="mb-1 text-[13.5px] leading-[1.45]">
                  <Mark text={s} />
                </li>
              ))}
            </ul>
          </>
        )}
        {resume.education.map((ed) => (
          <div key={ed.id} className="mt-6">
            <SectionLabel>Education</SectionLabel>
            <div className="text-[14px] font-semibold tracking-[-0.02em]">{ed.degree}</div>
            <div className="text-xs text-soft">{[ed.school, ed.year].filter(Boolean).join(" · ")}</div>
            {ed.detail ? <div className="mt-1 text-xs text-soft">{ed.detail}</div> : null}
          </div>
        ))}
      </aside>
      <div>
        <h1 className="font-display m-0 text-[36px] font-semibold leading-[1.05] tracking-[-0.035em]">{name}</h1>
        {resume.identity.title ? (
          <p className="mt-2 mb-6 text-[16px] tracking-[-0.011em] text-soft">{resume.identity.title}</p>
        ) : (
          <div className="mb-6" />
        )}
        {resume.summary ? (
          <>
            <SectionLabel>Profile</SectionLabel>
            <p className="mb-6 text-[14px] leading-[1.5]">
              <Mark text={resume.summary} />
            </p>
          </>
        ) : null}
        {resume.experience.length > 0 && (
          <>
            <SectionLabel>Selected work</SectionLabel>
            <Jobs resume={resume} />
          </>
        )}
        <Extras resume={resume} />
      </div>
    </div>
  );
}

export const ResumeSheet = memo(function ResumeSheet({
  resume,
  template,
  className,
  density = "regular",
}: {
  resume: Resume;
  template: TemplateId;
  className?: string;
  density?: Density;
}) {
  const name = resume.identity.name || "Your name";
  const contact = contactBits(resume);

  return (
    <article
      data-template={template}
      data-density={density}
      className={cn(
        "print-sheet sheet-root w-full max-w-resume bg-paper text-ink shadow-chambers",
        className,
      )}
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
        <SidebarBody resume={resume} />
      ) : (
        <div className={cn("sheet-pad", template === "executive" && "pt-8")}>
          {template !== "executive" && (
            <>
              <h1
                className={cn(
                  "m-0 font-semibold leading-[1.05]",
                  template === "editorial" &&
                    "font-serif text-[48px] font-medium tracking-[-0.04em] md:text-[52px]",
                  template === "classic" && "text-center text-[26px] font-semibold tracking-[0.14em] uppercase",
                  template === "compact" && "font-display text-[26px] tracking-[-0.03em]",
                  template === "letter" && "font-display text-[42px] tracking-[-0.035em]",
                )}
              >
                {name}
              </h1>
              {resume.identity.title ? (
                <p
                  className={cn(
                    "mt-2 mb-0 tracking-[-0.011em] text-soft",
                    template === "editorial" && "font-serif text-[18px] italic",
                    template === "classic" && "text-center text-[13px] tracking-[0.04em]",
                    template === "compact" && "text-[13px]",
                    template === "letter" && "text-[17px]",
                  )}
                >
                  {resume.identity.title}
                </p>
              ) : null}
              {contact.length > 0 && (
                <div
                  className={cn(
                    "mt-4 mb-7 flex flex-wrap gap-x-[18px] gap-y-2 text-xs text-soft",
                    template === "classic" && "justify-center",
                  )}
                >
                  {contact.map((c) => (
                    <span key={c}>{c}</span>
                  ))}
                </div>
              )}
              {template === "classic" ? (
                <div className="mx-auto mb-7 space-y-px">
                  <div className="h-px w-full bg-ink/25" />
                  <div className="h-px w-full bg-ink/10" />
                </div>
              ) : (
                <hr className={cn("mb-7 mt-0 h-px border-0", template === "compact" ? "bg-ink/15" : "bg-rule")} />
              )}
            </>
          )}
          {template === "compact" ? (
            <CompactBody resume={resume} />
          ) : template === "editorial" ? (
            <EditorialBody resume={resume} />
          ) : template === "classic" ? (
            <ClassicBody resume={resume} />
          ) : template === "executive" ? (
            <ExecutiveBody resume={resume} />
          ) : (
            <LetterBody resume={resume} />
          )}
        </div>
      )}
    </article>
  );
});

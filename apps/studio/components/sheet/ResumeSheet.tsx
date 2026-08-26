import type {
  ResumeCustomSection,
  ResumeData,
  ResumeEducation,
  ResumeExperience,
  ResumeProject,
  TemplateId,
} from "@/lib/resume/schema";
import { cleanLine, cleanUrl, displayUrl } from "@/lib/resume/sanitize";

/**
 * The Chambers sheet. Pure server-renderable component — no state, no effects.
 * Same visual contract as design/drops/resume-sheet. Everything it prints is
 * passed through the sanitizers, so stored data renders safely everywhere.
 */

function dateRange(start: string, end: string): string {
  const s = cleanLine(start);
  const e = cleanLine(end);
  if (s && e) return `${s} — ${e}`;
  return s || e || "";
}

function Bullets({ bullets }: { bullets: string[] }) {
  const items = bullets.map((b) => cleanLine(b)).filter(Boolean);
  if (items.length === 0) return null;
  return (
    <ul>
      {items.map((b, i) => (
        <li key={i}>{b}</li>
      ))}
    </ul>
  );
}

function ExperienceBlock({ items }: { items: ResumeExperience[] }) {
  return (
    <>
      {items.map((job) => (
        <div className="sheet-job" key={job.id}>
          <div className="sheet-job-top">
            <h3 className="sheet-h3">{cleanLine(job.role) || "Role"}</h3>
            <span className="sheet-when">{dateRange(job.start, job.end)}</span>
          </div>
          <div className="sheet-org">
            {[cleanLine(job.organization), cleanLine(job.location)].filter(Boolean).join(" · ")}
          </div>
          <Bullets bullets={job.bullets} />
        </div>
      ))}
    </>
  );
}

function EducationBlock({ items }: { items: ResumeEducation[] }) {
  return (
    <>
      {items.map((ed) => (
        <div className="sheet-job" key={ed.id}>
          <div className="sheet-job-top">
            <h3 className="sheet-h3">{cleanLine(ed.degree) || "Degree"}</h3>
            <span className="sheet-when">{dateRange(ed.start, ed.end)}</span>
          </div>
          <div className="sheet-org">
            {[cleanLine(ed.institution), cleanLine(ed.location)].filter(Boolean).join(" · ")}
          </div>
          {cleanLine(ed.notes) ? <div className="sheet-org">{cleanLine(ed.notes)}</div> : null}
        </div>
      ))}
    </>
  );
}

function ProjectsBlock({ items }: { items: ResumeProject[] }) {
  return (
    <>
      {items.map((p) => (
        <div className="sheet-job" key={p.id}>
          <div className="sheet-job-top">
            <h3 className="sheet-h3">{cleanLine(p.name) || "Project"}</h3>
            {cleanUrl(p.url) ? <span className="sheet-when">{displayUrl(cleanUrl(p.url))}</span> : null}
          </div>
          {cleanLine(p.description) ? <div className="sheet-org">{cleanLine(p.description)}</div> : null}
          <Bullets bullets={p.bullets} />
        </div>
      ))}
    </>
  );
}

function CustomBlock({ section }: { section: ResumeCustomSection }) {
  return (
    <section>
      <h2 className="sheet-h2">{cleanLine(section.title) || "Section"}</h2>
      {section.items.map((item) => (
        <div className="sheet-job" key={item.id}>
          <div className="sheet-job-top">
            <h3 className="sheet-h3">{cleanLine(item.heading)}</h3>
            {cleanLine(item.when) ? <span className="sheet-when">{cleanLine(item.when)}</span> : null}
          </div>
          {cleanLine(item.sub) ? <div className="sheet-org">{cleanLine(item.sub)}</div> : null}
          <Bullets bullets={item.bullets} />
        </div>
      ))}
    </section>
  );
}

export function ResumeSheet({ data, template }: { data: ResumeData; template: TemplateId }) {
  const { profile } = data;
  const hasExperience = data.experience.length > 0;
  const hasEducation = data.education.length > 0;
  const hasSkills = data.skills.some((s) => cleanLine(s.name));
  const hasProjects = data.projects.length > 0;
  const isEmpty =
    !cleanLine(profile.fullName) && !hasExperience && !hasEducation && !hasSkills && !hasProjects;

  const contact = [
    cleanLine(profile.location),
    cleanLine(profile.email),
    cleanLine(profile.phone),
  ].filter(Boolean);
  const links = profile.links
    .map((l) => ({ ...l, url: cleanUrl(l.url), label: cleanLine(l.label) }))
    .filter((l) => l.url);

  return (
    <article className="sheet" data-template={template}>
      <header className="sheet-header">
        <h1 className="sheet-name">{cleanLine(profile.fullName) || "Your name"}</h1>
        {cleanLine(profile.headline) ? (
          <p className="sheet-role">{cleanLine(profile.headline)}</p>
        ) : null}
        {contact.length > 0 || links.length > 0 ? (
          <div className="sheet-contact">
            {contact.map((c, i) => (
              <span key={`c${i}`}>{c}</span>
            ))}
            {links.map((l) => (
              <a key={l.id} href={l.url} rel="noopener noreferrer">
                {l.label || displayUrl(l.url)}
              </a>
            ))}
          </div>
        ) : null}
      </header>
      <hr className="sheet-rule" />

      {isEmpty ? (
        <p className="sheet-empty">
          A calm blank page. Start with your name on the left — the sheet follows as you type.
        </p>
      ) : null}

      {cleanLine(profile.summary) ? (
        <section>
          <h2 className="sheet-h2">Summary</h2>
          <p className="sheet-summary">{cleanLine(profile.summary)}</p>
        </section>
      ) : null}

      {hasExperience ? (
        <section>
          <h2 className="sheet-h2">Experience</h2>
          <ExperienceBlock items={data.experience} />
        </section>
      ) : null}

      {hasProjects ? (
        <section>
          <h2 className="sheet-h2">Projects</h2>
          <ProjectsBlock items={data.projects} />
        </section>
      ) : null}

      {hasEducation || hasSkills ? (
        <>
          <hr className="sheet-rule" />
          <div className="sheet-grid">
            {hasEducation ? (
              <div>
                <h2 className="sheet-h2">Education</h2>
                <EducationBlock items={data.education} />
              </div>
            ) : null}
            {hasSkills ? (
              <div>
                <h2 className="sheet-h2">Skills</h2>
                <div className="sheet-chips">
                  {data.skills
                    .map((s) => cleanLine(s.name))
                    .filter(Boolean)
                    .map((name, i) => (
                      <span className="sheet-chip" key={i}>
                        {name}
                      </span>
                    ))}
                </div>
              </div>
            ) : null}
          </div>
        </>
      ) : null}

      {data.custom.map((section) => (
        <CustomBlock section={section} key={section.id} />
      ))}
    </article>
  );
}

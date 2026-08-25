"use client";

import { Field, TextArea } from "@/components/ui/Field";
import type {
  ResumeCustomSection,
  ResumeData,
  ResumeEducation,
  ResumeExperience,
  ResumeProject,
} from "@/lib/resume/schema";

/**
 * The edit column. One purpose per control, no modals, no drag-and-drop —
 * reorder is two calm arrows. Every change flows up as a data mutation.
 */

type Mutate = (mutate: (data: ResumeData) => ResumeData) => void;

function newId(prefix: string): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function bulletsToText(bullets: string[]): string {
  return bullets.join("\n");
}

function textToBullets(text: string): string[] {
  return text.split("\n").slice(0, 12);
}

function move<T>(list: T[], index: number, delta: number): T[] {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  return next;
}

function Section({
  title,
  hint,
  action,
  children,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-line pb-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-caption font-semibold uppercase tracking-[0.16em] text-vermilion-600">
            {title}
          </h2>
          {hint ? <p className="mt-1 text-meta text-muted">{hint}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function AddButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-9 shrink-0 rounded-pill border border-line bg-white px-4 text-meta font-medium text-vermilion-600 transition-colors hover:border-[rgba(255,77,0,0.72)]"
    >
      {children}
    </button>
  );
}

function RowTools({
  onUp,
  onDown,
  onRemove,
}: {
  onUp: () => void;
  onDown: () => void;
  onRemove: () => void;
}) {
  const cls =
    "rounded-pill px-2 py-0.5 text-caption text-muted transition-colors hover:text-vermilion-600";
  return (
    <div className="flex items-center gap-1">
      <button type="button" aria-label="Move up" className={cls} onClick={onUp}>
        ↑
      </button>
      <button type="button" aria-label="Move down" className={cls} onClick={onDown}>
        ↓
      </button>
      <button type="button" aria-label="Remove" className={cls} onClick={onRemove}>
        Remove
      </button>
    </div>
  );
}

export function EditorPanel({ data, setData }: { data: ResumeData; setData: Mutate }) {
  const p = data.profile;
  const setProfile = (patch: Partial<ResumeData["profile"]>) =>
    setData((d) => ({ ...d, profile: { ...d.profile, ...patch } }));

  const setExperience = (items: ResumeExperience[]) => setData((d) => ({ ...d, experience: items }));
  const setEducation = (items: ResumeEducation[]) => setData((d) => ({ ...d, education: items }));
  const setProjects = (items: ResumeProject[]) => setData((d) => ({ ...d, projects: items }));
  const setCustom = (items: ResumeCustomSection[]) => setData((d) => ({ ...d, custom: items }));

  return (
    <div className="space-y-8">
      <Section title="Profile">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Full name"
            value={p.fullName}
            placeholder="Avery Lang"
            onChange={(e) => setProfile({ fullName: e.target.value })}
          />
          <Field
            label="Headline"
            value={p.headline}
            placeholder="What you do, in one line"
            onChange={(e) => setProfile({ headline: e.target.value })}
          />
          <Field
            label="Email"
            type="email"
            value={p.email}
            onChange={(e) => setProfile({ email: e.target.value })}
          />
          <Field
            label="Phone"
            value={p.phone}
            onChange={(e) => setProfile({ phone: e.target.value })}
          />
          <Field
            label="Location"
            value={p.location}
            placeholder="City / remote"
            onChange={(e) => setProfile({ location: e.target.value })}
          />
          <Field
            label="Link"
            value={p.links[0]?.url ?? ""}
            placeholder="portfolio.example"
            onChange={(e) => {
              const url = e.target.value;
              const first = p.links[0] ?? { id: newId("link"), label: "", url: "" };
              setProfile({ links: [{ ...first, url }, ...p.links.slice(1)] });
            }}
          />
        </div>
        <TextArea
          className="mt-4"
          label="Summary"
          value={p.summary}
          placeholder="Two or three sentences. Leave empty to omit the section."
          onChange={(e) => setProfile({ summary: e.target.value })}
        />
      </Section>

      <Section
        title="Experience"
        hint="One bullet per line. Lead with the outcome."
        action={
          <AddButton
            onClick={() =>
              setExperience([
                ...data.experience,
                {
                  id: newId("exp"),
                  role: "",
                  organization: "",
                  location: "",
                  start: "",
                  end: "",
                  bullets: [],
                },
              ])
            }
          >
            Add role
          </AddButton>
        }
      >
        <div className="space-y-6">
          {data.experience.length === 0 ? (
            <p className="text-body italic text-muted">No roles yet. Add your most recent first.</p>
          ) : null}
          {data.experience.map((job, i) => (
            <div key={job.id} className="rounded-chambers border border-line bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-caption font-medium uppercase tracking-[0.12em] text-muted">
                  Role {i + 1}
                </span>
                <RowTools
                  onUp={() => setExperience(move(data.experience, i, -1))}
                  onDown={() => setExperience(move(data.experience, i, 1))}
                  onRemove={() => setExperience(data.experience.filter((x) => x.id !== job.id))}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Role"
                  value={job.role}
                  onChange={(e) =>
                    setExperience(
                      data.experience.map((x) => (x.id === job.id ? { ...x, role: e.target.value } : x)),
                    )
                  }
                />
                <Field
                  label="Organization"
                  value={job.organization}
                  onChange={(e) =>
                    setExperience(
                      data.experience.map((x) =>
                        x.id === job.id ? { ...x, organization: e.target.value } : x,
                      ),
                    )
                  }
                />
                <Field
                  label="Start"
                  value={job.start}
                  placeholder="2023"
                  onChange={(e) =>
                    setExperience(
                      data.experience.map((x) => (x.id === job.id ? { ...x, start: e.target.value } : x)),
                    )
                  }
                />
                <Field
                  label="End"
                  value={job.end}
                  placeholder="present"
                  onChange={(e) =>
                    setExperience(
                      data.experience.map((x) => (x.id === job.id ? { ...x, end: e.target.value } : x)),
                    )
                  }
                />
              </div>
              <TextArea
                className="mt-3"
                label="Bullets — one per line"
                value={bulletsToText(job.bullets)}
                onChange={(e) =>
                  setExperience(
                    data.experience.map((x) =>
                      x.id === job.id ? { ...x, bullets: textToBullets(e.target.value) } : x,
                    ),
                  )
                }
              />
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Education"
        action={
          <AddButton
            onClick={() =>
              setEducation([
                ...data.education,
                {
                  id: newId("edu"),
                  degree: "",
                  institution: "",
                  location: "",
                  start: "",
                  end: "",
                  notes: "",
                },
              ])
            }
          >
            Add entry
          </AddButton>
        }
      >
        <div className="space-y-4">
          {data.education.length === 0 ? (
            <p className="text-body italic text-muted">Nothing yet. Facts only — never invent.</p>
          ) : null}
          {data.education.map((ed, i) => (
            <div key={ed.id} className="rounded-chambers border border-line bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-caption font-medium uppercase tracking-[0.12em] text-muted">
                  Entry {i + 1}
                </span>
                <RowTools
                  onUp={() => setEducation(move(data.education, i, -1))}
                  onDown={() => setEducation(move(data.education, i, 1))}
                  onRemove={() => setEducation(data.education.filter((x) => x.id !== ed.id))}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Degree"
                  value={ed.degree}
                  onChange={(e) =>
                    setEducation(
                      data.education.map((x) => (x.id === ed.id ? { ...x, degree: e.target.value } : x)),
                    )
                  }
                />
                <Field
                  label="Institution"
                  value={ed.institution}
                  onChange={(e) =>
                    setEducation(
                      data.education.map((x) =>
                        x.id === ed.id ? { ...x, institution: e.target.value } : x,
                      ),
                    )
                  }
                />
                <Field
                  label="Start"
                  value={ed.start}
                  onChange={(e) =>
                    setEducation(
                      data.education.map((x) => (x.id === ed.id ? { ...x, start: e.target.value } : x)),
                    )
                  }
                />
                <Field
                  label="End"
                  value={ed.end}
                  onChange={(e) =>
                    setEducation(
                      data.education.map((x) => (x.id === ed.id ? { ...x, end: e.target.value } : x)),
                    )
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Skills" hint="Comma-separated. Rendered as chips on the sheet.">
        <Field
          label="Skills"
          value={data.skills.map((s) => s.name).join(", ")}
          placeholder="Next.js, Supabase, EPUB 3"
          onChange={(e) => {
            const names = e.target.value.split(",").slice(0, 40);
            setData((d) => ({
              ...d,
              skills: names.map((name, i) => ({ id: d.skills[i]?.id ?? newId("skill"), name })),
            }));
          }}
        />
      </Section>

      <Section
        title="Projects"
        action={
          <AddButton
            onClick={() =>
              setProjects([
                ...data.projects,
                { id: newId("proj"), name: "", url: "", description: "", bullets: [] },
              ])
            }
          >
            Add project
          </AddButton>
        }
      >
        <div className="space-y-4">
          {data.projects.length === 0 ? (
            <p className="text-body italic text-muted">Optional. Ship things? Put them here.</p>
          ) : null}
          {data.projects.map((project, i) => (
            <div key={project.id} className="rounded-chambers border border-line bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-caption font-medium uppercase tracking-[0.12em] text-muted">
                  Project {i + 1}
                </span>
                <RowTools
                  onUp={() => setProjects(move(data.projects, i, -1))}
                  onDown={() => setProjects(move(data.projects, i, 1))}
                  onRemove={() => setProjects(data.projects.filter((x) => x.id !== project.id))}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Name"
                  value={project.name}
                  onChange={(e) =>
                    setProjects(
                      data.projects.map((x) =>
                        x.id === project.id ? { ...x, name: e.target.value } : x,
                      ),
                    )
                  }
                />
                <Field
                  label="URL"
                  value={project.url}
                  onChange={(e) =>
                    setProjects(
                      data.projects.map((x) => (x.id === project.id ? { ...x, url: e.target.value } : x)),
                    )
                  }
                />
              </div>
              <Field
                className="mt-3"
                label="One-line description"
                value={project.description}
                onChange={(e) =>
                  setProjects(
                    data.projects.map((x) =>
                      x.id === project.id ? { ...x, description: e.target.value } : x,
                    ),
                  )
                }
              />
              <TextArea
                className="mt-3"
                label="Bullets — one per line"
                value={bulletsToText(project.bullets)}
                onChange={(e) =>
                  setProjects(
                    data.projects.map((x) =>
                      x.id === project.id ? { ...x, bullets: textToBullets(e.target.value) } : x,
                    ),
                  )
                }
              />
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Custom sections"
        hint="Certifications, awards, talks — anything with a heading."
        action={
          <AddButton
            onClick={() =>
              setCustom([
                ...data.custom,
                {
                  id: newId("custom"),
                  title: "",
                  items: [{ id: newId("ci"), heading: "", sub: "", when: "", bullets: [] }],
                },
              ])
            }
          >
            Add section
          </AddButton>
        }
      >
        <div className="space-y-4">
          {data.custom.map((section) => (
            <div key={section.id} className="rounded-chambers border border-line bg-white p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <Field
                  className="flex-1"
                  label="Section title"
                  value={section.title}
                  placeholder="Certifications"
                  onChange={(e) =>
                    setCustom(
                      data.custom.map((x) =>
                        x.id === section.id ? { ...x, title: e.target.value } : x,
                      ),
                    )
                  }
                />
                <button
                  type="button"
                  className="mt-5 shrink-0 rounded-pill px-2 py-0.5 text-caption text-muted hover:text-vermilion-600"
                  onClick={() => setCustom(data.custom.filter((x) => x.id !== section.id))}
                >
                  Remove
                </button>
              </div>
              {section.items.map((item) => (
                <div key={item.id} className="mt-2 grid gap-3 sm:grid-cols-3">
                  <Field
                    label="Heading"
                    value={item.heading}
                    onChange={(e) =>
                      setCustom(
                        data.custom.map((x) =>
                          x.id === section.id
                            ? {
                                ...x,
                                items: x.items.map((it) =>
                                  it.id === item.id ? { ...it, heading: e.target.value } : it,
                                ),
                              }
                            : x,
                        ),
                      )
                    }
                  />
                  <Field
                    label="Detail"
                    value={item.sub}
                    onChange={(e) =>
                      setCustom(
                        data.custom.map((x) =>
                          x.id === section.id
                            ? {
                                ...x,
                                items: x.items.map((it) =>
                                  it.id === item.id ? { ...it, sub: e.target.value } : it,
                                ),
                              }
                            : x,
                        ),
                      )
                    }
                  />
                  <Field
                    label="When"
                    value={item.when}
                    onChange={(e) =>
                      setCustom(
                        data.custom.map((x) =>
                          x.id === section.id
                            ? {
                                ...x,
                                items: x.items.map((it) =>
                                  it.id === item.id ? { ...it, when: e.target.value } : it,
                                ),
                              }
                            : x,
                        ),
                      )
                    }
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

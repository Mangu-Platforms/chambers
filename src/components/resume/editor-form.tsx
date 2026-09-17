import { memo, useState } from "react";
import { ChevronDown, ChevronUp, Copy, Plus, Trash2 } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { bulletHint, hintLine, looksLikeEmail, stripProtocol } from "@/lib/resume/quality";
import { useResumeStore } from "@/lib/resume/store";

export const EditorForm = memo(function EditorForm() {
  return (
    <div className="flex flex-col gap-8 pb-16">
      <IdentitySection />
      <SummarySection />
      <ExperienceList />
      <EducationList />
      <SkillsSection />
      <ExtrasList />
    </div>
  );
});

function IdentitySection() {
  const id = useResumeStore((s) => s.resume.identity);
  const patchIdentity = useResumeStore((s) => s.patchIdentity);
  return (
    <section>
      <p className="kicker mb-4">Identity</p>
      {!id.name.trim() ? (
        <p className="mb-3 text-caption text-soft">Start with your name — the sheet stays blank until you do.</p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Name">
          <Input value={id.name} onChange={(e) => patchIdentity({ name: e.target.value })} />
        </Field>
        <Field label="Headline">
          <Input value={id.title} onChange={(e) => patchIdentity({ title: e.target.value })} />
        </Field>
        <Field label="Location">
          <Input
            value={id.location}
            onChange={(e) => patchIdentity({ location: e.target.value })}
          />
        </Field>
        <Field label="Email">
          <Input
            value={id.email}
            onChange={(e) => patchIdentity({ email: e.target.value })}
            inputMode="email"
            autoComplete="email"
          />
          {id.email.trim() && !looksLikeEmail(id.email) ? (
            <p className="mt-1 text-xs text-ember">Doesn’t look like an email.</p>
          ) : null}
        </Field>
        <Field label="Phone">
          <Input value={id.phone} onChange={(e) => patchIdentity({ phone: e.target.value })} />
        </Field>
        <Field label="Website">
          <Input
            value={id.website}
            onChange={(e) => patchIdentity({ website: e.target.value })}
            onBlur={(e) => patchIdentity({ website: stripProtocol(e.target.value) })}
          />
        </Field>
        <Field label="LinkedIn">
          <Input
            value={id.linkedin}
            onChange={(e) => patchIdentity({ linkedin: e.target.value })}
            onBlur={(e) => patchIdentity({ linkedin: stripProtocol(e.target.value) })}
          />
        </Field>
      </div>
    </section>
  );
}

function SummarySection() {
  const summary = useResumeStore((s) => s.resume.summary);
  const setSummary = useResumeStore((s) => s.setSummary);
  const words = summary.trim() ? summary.trim().split(/\s+/).length : 0;
  return (
    <section>
      <div className="mb-4 flex items-baseline justify-between">
        <p className="kicker">Summary</p>
        <span className="text-xs tabular-nums text-soft">{words} words</span>
      </div>
      <Textarea rows={4} value={summary} onChange={(e) => setSummary(e.target.value)} />
    </section>
  );
}

function ExperienceList() {
  const ids = useResumeStore(useShallow((s) => s.resume.experience.map((j) => j.id)));
  const addExperience = useResumeStore((s) => s.addExperience);
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <p className="kicker">Selected work</p>
        <Button type="button" size="sm" variant="ghost" onClick={addExperience}>
          <Plus className="size-4" /> Add role
        </Button>
      </div>
      <div className="flex flex-col gap-4">
        {ids.map((id) => (
          <JobCard key={id} id={id} />
        ))}
      </div>
    </section>
  );
}

const JobCard = memo(function JobCard({ id }: { id: string }) {
  const job = useResumeStore((s) => s.resume.experience.find((j) => j.id === id));
  const updateExperience = useResumeStore((s) => s.updateExperience);
  const removeExperience = useResumeStore((s) => s.removeExperience);
  const duplicateExperience = useResumeStore((s) => s.duplicateExperience);
  const moveExperience = useResumeStore((s) => s.moveExperience);
  const moveBullet = useResumeStore((s) => s.moveBullet);
  const index = useResumeStore((s) => s.resume.experience.findIndex((j) => j.id === id));
  const last = useResumeStore((s) => s.resume.experience.length - 1);
  if (!job) return null;
  return (
    <div className="hairline rounded-lg bg-paper p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <p className="text-sm font-semibold tracking-[-0.02em]">{job.role || "Role"}</p>
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => moveExperience(id, -1)}
            disabled={index <= 0}
            className="grid size-11 place-items-center rounded-pill text-soft hover:text-ink disabled:opacity-30"
            aria-label="Move role up"
          >
            <ChevronUp className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => moveExperience(id, 1)}
            disabled={index >= last}
            className="grid size-11 place-items-center rounded-pill text-soft hover:text-ink disabled:opacity-30"
            aria-label="Move role down"
          >
            <ChevronDown className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => duplicateExperience(id)}
            className="grid size-11 place-items-center rounded-pill text-soft hover:text-ink"
            aria-label="Duplicate role"
          >
            <Copy className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => removeExperience(id)}
            className="grid size-11 place-items-center rounded-pill text-soft hover:text-ember"
            aria-label="Remove role"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Role">
          <Input
            value={job.role}
            onChange={(e) => updateExperience(id, { ...job, role: e.target.value })}
          />
        </Field>
        <Field label="Organization">
          <Input
            value={job.org}
            onChange={(e) => updateExperience(id, { ...job, org: e.target.value })}
          />
        </Field>
        <Field label="Location">
          <Input
            value={job.location}
            onChange={(e) => updateExperience(id, { ...job, location: e.target.value })}
          />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Start">
            <Input
              value={job.start}
              onChange={(e) => updateExperience(id, { ...job, start: e.target.value })}
            />
          </Field>
          <Field label="End">
            <Input
              value={job.end}
              onChange={(e) => updateExperience(id, { ...job, end: e.target.value })}
            />
          </Field>
        </div>
      </div>
      <div className="mt-3 flex flex-col gap-2">
        <span className="text-micro font-semibold uppercase tracking-[0.12em] text-soft">
          Bullets
        </span>
        {job.bullets.map((b, i) => {
          const hint = b.trim() ? hintLine(bulletHint(b)!) : null;
          return (
            <div key={`${job.id}-b-${i}`}>
              <div className="flex gap-1">
                <div className="flex flex-col">
                  <button
                    type="button"
                    disabled={i === 0}
                    className="grid size-8 place-items-center rounded-pill text-soft hover:text-ink disabled:opacity-30"
                    onClick={() => moveBullet(id, i, -1)}
                    aria-label="Move bullet up"
                  >
                    <ChevronUp className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={i === job.bullets.length - 1}
                    className="grid size-8 place-items-center rounded-pill text-soft hover:text-ink disabled:opacity-30"
                    onClick={() => moveBullet(id, i, 1)}
                    aria-label="Move bullet down"
                  >
                    <ChevronDown className="size-3.5" />
                  </button>
                </div>
                <Textarea
                  rows={2}
                  className="min-h-16"
                  value={b}
                  onChange={(e) => {
                    const bullets = job.bullets.slice();
                    bullets[i] = e.target.value;
                    updateExperience(id, { ...job, bullets });
                  }}
                />
                <button
                  type="button"
                  className="grid size-11 shrink-0 place-items-center rounded-pill text-soft hover:text-ember"
                  onClick={() =>
                    updateExperience(id, {
                      ...job,
                      bullets: job.bullets.filter((_, idx) => idx !== i),
                    })
                  }
                  aria-label="Remove bullet"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              {hint ? <p className="ml-9 text-xs text-soft">{hint}</p> : null}
            </div>
          );
        })}
        <Button
          type="button"
          size="sm"
          variant="soft"
          onClick={() => updateExperience(id, { ...job, bullets: [...job.bullets, ""] })}
        >
          <Plus className="size-4" /> Bullet
        </Button>
      </div>
    </div>
  );
});

function EducationList() {
  const ids = useResumeStore(useShallow((s) => s.resume.education.map((e) => e.id)));
  const addEducation = useResumeStore((s) => s.addEducation);
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <p className="kicker">Education</p>
        <Button type="button" size="sm" variant="ghost" onClick={addEducation}>
          <Plus className="size-4" /> Add
        </Button>
      </div>
      <div className="flex flex-col gap-3">
        {ids.map((id) => (
          <EduCard key={id} id={id} />
        ))}
      </div>
    </section>
  );
}

const EduCard = memo(function EduCard({ id }: { id: string }) {
  const ed = useResumeStore((s) => s.resume.education.find((e) => e.id === id));
  const updateEducation = useResumeStore((s) => s.updateEducation);
  const removeEducation = useResumeStore((s) => s.removeEducation);
  const moveEducation = useResumeStore((s) => s.moveEducation);
  const index = useResumeStore((s) => s.resume.education.findIndex((e) => e.id === id));
  const last = useResumeStore((s) => s.resume.education.length - 1);
  if (!ed) return null;
  return (
    <div className="hairline rounded-lg p-4">
      <div className="mb-2 flex justify-end">
        <button
          type="button"
          onClick={() => moveEducation(id, -1)}
          disabled={index <= 0}
          className="grid size-11 place-items-center rounded-pill text-soft hover:text-ink disabled:opacity-30"
          aria-label="Move education up"
        >
          <ChevronUp className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => moveEducation(id, 1)}
          disabled={index >= last}
          className="grid size-11 place-items-center rounded-pill text-soft hover:text-ink disabled:opacity-30"
          aria-label="Move education down"
        >
          <ChevronDown className="size-4" />
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Degree">
          <Input
            value={ed.degree}
            onChange={(e) => updateEducation(id, { ...ed, degree: e.target.value })}
          />
        </Field>
        <Field label="School">
          <Input
            value={ed.school}
            onChange={(e) => updateEducation(id, { ...ed, school: e.target.value })}
          />
        </Field>
        <Field label="Year">
          <Input
            value={ed.year}
            onChange={(e) => updateEducation(id, { ...ed, year: e.target.value })}
          />
        </Field>
        <Field label="Detail">
          <Input
            value={ed.detail}
            onChange={(e) => updateEducation(id, { ...ed, detail: e.target.value })}
          />
        </Field>
      </div>
      <button
        type="button"
        onClick={() => removeEducation(id)}
        className="mt-2 min-h-11 text-xs text-soft hover:text-ember"
      >
        Remove
      </button>
    </div>
  );
});

function SkillsSection() {
  const skills = useResumeStore((s) => s.resume.skills);
  const addSkill = useResumeStore((s) => s.addSkill);
  const removeSkill = useResumeStore((s) => s.removeSkill);
  const [draft, setDraft] = useState("");
  return (
    <section>
      <p className="kicker mb-4">Skills</p>
      <div className="flex flex-wrap gap-1.5">
        {skills.filter(Boolean).map((s) => (
          <span
            key={s}
            className="inline-flex h-8 items-center gap-0.5 rounded-pill border border-hair bg-fog pl-2.5 pr-0.5 text-caption"
          >
            {s}
            <button
              type="button"
              aria-label={`Remove ${s}`}
              className="grid size-8 place-items-center rounded-pill text-soft hover:text-ember"
              onClick={() => removeSkill(s)}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (addSkill(draft)) setDraft("");
        }}
      >
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a skill you already use"
          aria-label="Add skill"
        />
        <Button type="submit" size="sm" variant="soft">
          Add
        </Button>
      </form>
      <p className="mt-1.5 text-xs text-soft">Only list tools you actually use. Parsers prefer a flat list.</p>
    </section>
  );
}

function ExtrasList() {
  const ids = useResumeStore(useShallow((s) => s.resume.extras.map((x) => x.id)));
  const addExtra = useResumeStore((s) => s.addExtra);
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <p className="kicker">Additional</p>
        <Button type="button" size="sm" variant="ghost" onClick={addExtra}>
          <Plus className="size-4" /> Add
        </Button>
      </div>
      <div className="flex flex-col gap-3">
        {ids.map((id) => (
          <ExtraCard key={id} id={id} />
        ))}
      </div>
    </section>
  );
}

const ExtraCard = memo(function ExtraCard({ id }: { id: string }) {
  const extra = useResumeStore((s) => s.resume.extras.find((x) => x.id === id));
  const updateExtra = useResumeStore((s) => s.updateExtra);
  const removeExtra = useResumeStore((s) => s.removeExtra);
  const moveExtra = useResumeStore((s) => s.moveExtra);
  const index = useResumeStore((s) => s.resume.extras.findIndex((x) => x.id === id));
  const last = useResumeStore((s) => s.resume.extras.length - 1);
  if (!extra) return null;
  return (
    <div className="hairline rounded-lg p-4">
      <div className="mb-2 flex justify-end">
        <button
          type="button"
          onClick={() => moveExtra(id, -1)}
          disabled={index <= 0}
          className="grid size-11 place-items-center rounded-pill text-soft hover:text-ink disabled:opacity-30"
          aria-label="Move section up"
        >
          <ChevronUp className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => moveExtra(id, 1)}
          disabled={index >= last}
          className="grid size-11 place-items-center rounded-pill text-soft hover:text-ink disabled:opacity-30"
          aria-label="Move section down"
        >
          <ChevronDown className="size-4" />
        </button>
      </div>
      <Field label="Label">
        <Input
          value={extra.label}
          onChange={(e) => updateExtra(id, { ...extra, label: e.target.value })}
        />
      </Field>
      <Field label="Items" hint="One per line">
        <Textarea
          rows={3}
          value={extra.items.join("\n")}
          onChange={(e) =>
            updateExtra(id, {
              ...extra,
              items: e.target.value.split("\n"),
            })
          }
        />
      </Field>
      <button
        type="button"
        onClick={() => removeExtra(id)}
        className="mt-1 min-h-11 text-xs text-soft hover:text-ember"
      >
        Remove
      </button>
    </div>
  );
});

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { LiveMatch } from "@/components/ats/live-match";
import { AppNav } from "@/components/layout/nav";
import { PageSkeleton } from "@/components/layout/skeleton";
import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/input";
import { useHydrated } from "@/hooks/use-hydrated";
import { rewriteBulletAi, writeSummaryAi } from "@/lib/ai/resume-ai";
import { localVariants } from "@/lib/resume/bullet-local";
import { writeSummaryLocal } from "@/lib/resume/summary-local";
import { actionVerb, hasMetric, uniqueKeywords } from "@/lib/resume/text";
import { useResumeStore } from "@/lib/resume/store";

export const Route = createFileRoute("/tools")({ component: ToolsPage });

function ToolsPage() {
  const ready = useHydrated();
  if (!ready) return <PageSkeleton label="Loading tools" />;
  return (
    <div className="min-h-screen bg-paper">
      <AppNav />
      <div id="main" className="mx-auto max-w-page px-5 py-12 md:px-8">
        <span className="kicker">Free tools</span>
        <h1 className="font-serif mt-3 text-3xl font-medium tracking-[-0.03em] md:text-5xl">Instant checks. Honest rewrites.</h1>
        <p className="mt-4 max-w-2xl text-body text-soft">ATS scoring is local and free. Rewrites never invent a new employer.</p>
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <AtsCard />
          <BulletCard />
          <SummaryCard />
          <KeywordsCard />
        </div>
      </div>
    </div>
  );
}

function AtsCard() {
  const jobDescription = useResumeStore((s) => s.jobDescription);
  const setJobDescription = useResumeStore((s) => s.setJobDescription);
  return (
    <section className="hairline rounded-lg p-5">
      <h2 className="font-display text-[22px] font-semibold tracking-[-0.03em]">ATS check</h2>
      <Field label="Job description">
        <Textarea className="min-h-36" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
      </Field>
      <div className="mt-5">
        <LiveMatch />
      </div>
    </section>
  );
}

function BulletCard() {
  const resume = useResumeStore((s) => s.resume);
  const jobDescription = useResumeStore((s) => s.jobDescription);
  const replaceBullet = useResumeStore((s) => s.replaceBullet);
  const options = resume.experience.flatMap((j) =>
    j.bullets.map((b, i) => ({ key: `${j.id}:${i}`, jobId: j.id, index: i, role: j.role, text: b })),
  );
  const [selected, setSelected] = useState(options[0]?.key ?? "");
  const current = options.find((o) => o.key === selected) ?? options[0];
  const [bullet, setBullet] = useState(current?.text ?? "");
  const [variants, setVariants] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const rewrite = async () => {
    if (bullet.trim().length < 8) return;
    setBusy(true);
    try {
      const ai = await rewriteBulletAi({ data: { bullet, context: `${resume.identity.title}\n${current?.role ?? ""}`, jobDescription } });
      setVariants(ai.ok ? ai.variants : localVariants(bullet));
    } catch {
      setVariants(localVariants(bullet));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="hairline rounded-lg p-5">
      <h2 className="font-display text-[22px] font-semibold tracking-[-0.03em]">Rewrite a bullet</h2>
      {options.length > 0 ? (
        <label className="mt-3 block">
          <span className="mb-1.5 block text-micro font-semibold uppercase tracking-[0.12em] text-soft">Line on the sheet</span>
          <select
            className="h-11 w-full rounded-md border border-hair bg-paper px-3 text-body outline-none focus:ring-2 focus:ring-vermilion/20"
            value={current?.key ?? ""}
            onChange={(e) => {
              const next = options.find((o) => o.key === e.target.value);
              setSelected(e.target.value);
              setBullet(next?.text ?? "");
              setVariants([]);
            }}
          >
            {options.map((o) => (
              <option key={o.key} value={o.key}>
                {o.role}: {o.text.slice(0, 56) || "(empty)"}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <Field label="Current line">
        <Textarea className="min-h-24" value={bullet} onChange={(e) => setBullet(e.target.value)} />
      </Field>
      <p className="mt-2 text-xs text-soft">
        Verb: {actionVerb(bullet) ? "yes" : "no"} · Metric: {hasMetric(bullet) ? "yes" : "no"}
      </p>
      <Button className="mt-3" disabled={busy} onClick={() => void rewrite()}>
        {busy ? "Rewriting…" : "Three variants"}
      </Button>
      {variants.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2">
          {variants.map((v) => (
            <li key={v}>
              <button
                type="button"
                className="w-full rounded-md border border-hair px-3 py-2.5 text-left text-body hover:border-hair-strong"
                onClick={() => {
                  if (!current) return;
                  replaceBullet(current.jobId, current.index, v);
                  setBullet(v);
                  toast.success("Applied to the sheet");
                }}
              >
                {v}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function SummaryCard() {
  const resume = useResumeStore((s) => s.resume);
  const jobDescription = useResumeStore((s) => s.jobDescription);
  const patchResume = useResumeStore((s) => s.patchResume);
  const [busy, setBusy] = useState(false);

  const summary = async () => {
    setBusy(true);
    try {
      const ai = await writeSummaryAi({ data: { resume, jobDescription } });
      if (ai.ok) {
        patchResume({ summary: ai.summary });
        toast.success("Summary updated on the sheet");
      } else {
        patchResume({ summary: writeSummaryLocal(resume, jobDescription) });
        toast.message("Local summary — from your facts.");
      }
    } catch {
      patchResume({ summary: writeSummaryLocal(resume, jobDescription) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="hairline rounded-lg p-5">
      <h2 className="font-display text-[22px] font-semibold tracking-[-0.03em]">Summary generator</h2>
      <p className="mt-2 text-body leading-relaxed text-soft">Two or three sentences from the resume on the sheet.</p>
      <p className="mt-4 rounded-md bg-fog px-3 py-3 text-body leading-relaxed">{resume.summary || "No summary yet."}</p>
      <Button className="mt-4" disabled={busy} onClick={() => void summary()}>
        {busy ? "Writing…" : "Rewrite summary"}
      </Button>
    </section>
  );
}

function KeywordsCard() {
  const jobDescription = useResumeStore((s) => s.jobDescription);
  const keys = uniqueKeywords(jobDescription);
  return (
    <section className="hairline rounded-lg p-5">
      <h2 className="font-display text-[22px] font-semibold tracking-[-0.03em]">Keywords in the posting</h2>
      <p className="mt-2 text-body text-soft">Extracted locally. If it is not evidenced, do not invent it.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {keys.length === 0 ? (
          <span className="text-sm text-soft">Paste a posting in the ATS box.</span>
        ) : (
          keys.map((k) => (
            <span key={k} className="inline-flex h-7 items-center rounded-pill border border-hair px-2.5 text-[11px]">
              {k}
            </span>
          ))
        )}
      </div>
    </section>
  );
}

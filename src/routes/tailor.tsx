import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, History } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { LiveMatch } from "@/components/ats/live-match";
import { NotesCard } from "@/components/ats/notes-card";
import { AppNav } from "@/components/layout/nav";
import { PageSkeleton } from "@/components/layout/skeleton";
import { LivePaper } from "@/components/resume/live-paper";
import { PaperStage } from "@/components/resume/paper-stage";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { useHydrated } from "@/hooks/use-hydrated";
import { raceAi } from "@/lib/ai/timeout";
import { tailorResumeAi, writeCoverLetterAi } from "@/lib/ai/resume-ai";
import { writeLetterLocal } from "@/lib/resume/letter-local";
import {
  SAMPLE_JD_EDITORIAL,
  SAMPLE_JD_ENGINEER,
  SAMPLE_TARGET_EDITORIAL,
  SAMPLE_TARGET_ENGINEER,
} from "@/lib/resume/sample";
import { useResumeStore } from "@/lib/resume/store";
import { tailorLocal } from "@/lib/resume/tailor-local";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/tailor")({ component: TailorPage });

function TailorPage() {
  const ready = useHydrated();
  const [view, setView] = useState<"tailored" | "original">("tailored");
  const snapshot = useResumeStore((s) => (ready ? s.snapshot : null));
  if (!ready) return <PageSkeleton label="Loading tailor" />;

  return (
    <div className="min-h-screen bg-fog">
      <AppNav />
      <div id="main" className="mx-auto grid max-w-page gap-8 px-5 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:px-8">
        <TailorForm />
        <div>
          {snapshot ? (
            <div className="no-print mb-3 flex w-fit rounded-pill border border-hair p-0.5">
              <button type="button" onClick={() => setView("tailored")} className={cn("h-8 rounded-pill px-3 text-caption font-semibold", view === "tailored" ? "bg-ink text-paper" : "text-soft")}>
                Tailored
              </button>
              <button type="button" onClick={() => setView("original")} className={cn("h-8 rounded-pill px-3 text-caption font-semibold", view === "original" ? "bg-ink text-paper" : "text-soft")}>
                Original
              </button>
            </div>
          ) : null}
          <PaperStage>
            <LivePaper className="mx-0" resume={view === "original" && snapshot ? snapshot : undefined} />
          </PaperStage>
        </div>
      </div>
    </div>
  );
}

function TailorForm() {
  const jobDescription = useResumeStore((s) => s.jobDescription);
  const setJobDescription = useResumeStore((s) => s.setJobDescription);
  const loadPosting = useResumeStore((s) => s.loadPosting);
  const resume = useResumeStore((s) => s.resume);
  const setResume = useResumeStore((s) => s.setResume);
  const rememberSnapshot = useResumeStore((s) => s.rememberSnapshot);
  const setLetter = useResumeStore((s) => s.setLetter);
  const setNotes = useResumeStore((s) => s.setNotes);
  const notes = useResumeStore((s) => s.notes);
  const snapshot = useResumeStore((s) => s.snapshot);
  const undoTailor = useResumeStore((s) => s.undoTailor);
  const targetCompany = useResumeStore((s) => s.targetCompany);
  const targetRole = useResumeStore((s) => s.targetRole);
  const setTarget = useResumeStore((s) => s.setTarget);
  const [busy, setBusy] = useState<"tailor" | "letter" | null>(null);

  const runTailor = async () => {
    if (jobDescription.trim().length < 40) {
      toast.error("Paste a fuller job description.");
      return;
    }
    setBusy("tailor");
    rememberSnapshot();
    const local = tailorLocal(resume, jobDescription);
    setResume(local.resume);
    setNotes(local.notes);
    toast.message("Sheet updated. Checking the assistant…");
    const ai = await raceAi(tailorResumeAi({ data: { resume, jobDescription } }), 12000);
    if (ai?.ok) {
      setResume(ai.resume);
      setNotes(ai.notes);
      toast.success("Tailored from your facts");
    } else {
      toast.message("Local tailor — no invention.");
    }
    setBusy(null);
  };

  const runLetter = async () => {
    if (jobDescription.trim().length < 40) {
      toast.error("Paste the posting first.");
      return;
    }
    setBusy("letter");
    const local = writeLetterLocal(resume, jobDescription, targetCompany, targetRole);
    setLetter(local);
    const ai = await raceAi(
      writeCoverLetterAi({ data: { resume, jobDescription, company: targetCompany, role: targetRole } }),
      10000,
    );
    if (ai?.ok) {
      setLetter(ai.letter);
      toast.success("Cover letter drafted");
    } else {
      toast.message("Drafted a local letter.");
    }
    setBusy(null);
  };

  return (
    <div className="no-print">
      <span className="kicker">Tailor</span>
      <h1 className="font-serif mt-3 text-3xl font-medium tracking-[-0.03em]">One posting. One version.</h1>
      <p className="mt-2 text-body text-soft">We reorder and rephrase what you already did. Missing requirements stay listed — never fabricated.</p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Button size="sm" variant="soft" type="button" onClick={() => loadPosting(SAMPLE_JD_EDITORIAL, SAMPLE_TARGET_EDITORIAL.company, SAMPLE_TARGET_EDITORIAL.role)}>
          Load editorial posting
        </Button>
        <Button size="sm" variant="ghost" type="button" onClick={() => loadPosting(SAMPLE_JD_ENGINEER, SAMPLE_TARGET_ENGINEER.company, SAMPLE_TARGET_ENGINEER.role)}>
          Load engineering posting
        </Button>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Field label="Company">
          <Input value={targetCompany} onChange={(e) => setTarget(e.target.value, targetRole)} placeholder="Acme Press Systems" />
        </Field>
        <Field label="Role">
          <Input value={targetRole} onChange={(e) => setTarget(targetCompany, e.target.value)} placeholder="Senior Product Designer" />
        </Field>
      </div>
      <Field label="Job description">
        <Textarea className="mt-0 min-h-56" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste the full posting…" />
      </Field>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button disabled={busy !== null} onClick={() => void runTailor()}>
          {busy === "tailor" ? (notes ? "Refining…" : "Tailoring…") : "Tailor this resume"}
        </Button>
        <Button variant="ink" disabled={busy !== null} onClick={() => void runLetter()}>
          {busy === "letter" ? "Writing…" : "Draft cover letter"}
        </Button>
        {snapshot ? (
          <Button variant="ghost" onClick={undoTailor}>
            <History className="size-4" /> Undo
          </Button>
        ) : null}
      </div>
      <div className="mt-8 hairline rounded-lg bg-paper p-5">
        <LiveMatch />
      </div>
      {notes ? <NotesCard notes={notes} className="mt-4" /> : null}
      <Link to="/letter" className="mt-5 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-ember">
        Open the letter <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

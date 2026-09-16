import { createFileRoute, Link } from "@tanstack/react-router";
import { History, LayoutTemplate, PenLine, Target } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { LiveMatch } from "@/components/ats/live-match";
import { NotesCard } from "@/components/ats/notes-card";
import { AppNav } from "@/components/layout/nav";
import { PageSkeleton } from "@/components/layout/skeleton";
import { EditorForm } from "@/components/resume/editor-form";
import { LivePaper } from "@/components/resume/live-paper";
import { PaperStage } from "@/components/resume/paper-stage";
import { PrintButton } from "@/components/resume/print-button";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/hooks/use-hydrated";
import { useResumeStore } from "@/lib/resume/store";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/studio")({ component: StudioPage });

function StudioPage() {
  const ready = useHydrated();
  const [tab, setTab] = useState<"edit" | "paper" | "check">("paper");
  const [view, setView] = useState<"current" | "original">("current");
  const snapshot = useResumeStore((s) => (ready ? s.snapshot : null));

  if (!ready) return <PageSkeleton label="Opening the studio" />;

  return (
    <div className="min-h-screen bg-fog">
      <AppNav />
      <div className="no-print flex items-center gap-1 border-b border-hair bg-paper px-3 py-1.5 md:px-5">
        <ToolLink to="/tools" icon={PenLine} label="Fix copy" />
        <ToolLink to="/tailor" icon={Target} label="Tailor" />
        <ToolLink to="/templates" icon={LayoutTemplate} label="Library" />
        <span className="ml-auto">
          <PrintButton />
        </span>
      </div>
      <div className="no-print flex gap-1 border-b border-hair bg-paper px-3 py-2 lg:hidden">
        {(["edit", "paper", "check"] as const).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn("h-11 flex-1 rounded-pill text-sm font-semibold capitalize", tab === id ? "bg-ink text-paper" : "text-soft")}
          >
            {id}
          </button>
        ))}
      </div>
      <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[minmax(280px,380px)_minmax(0,1fr)_minmax(260px,320px)]">
        <aside className={cn("no-print max-h-[calc(100vh-8rem)] overflow-y-auto border-r border-hair bg-paper px-4 py-6", tab === "edit" ? "block" : "hidden lg:block")}>
          <MasterActions />
          <EditorForm />
        </aside>
        <section id="main" className={cn("min-h-[70vh] overflow-auto px-3 py-6 md:px-8", tab === "paper" ? "block" : "hidden lg:block")}>
          {snapshot ? (
            <div className="no-print mb-3 flex w-fit rounded-pill border border-hair p-0.5">
              <button type="button" onClick={() => setView("current")} className={cn("h-8 rounded-pill px-3 text-caption font-semibold", view === "current" ? "bg-ink text-paper" : "text-soft")}>
                Current
              </button>
              <button type="button" onClick={() => setView("original")} className={cn("h-8 rounded-pill px-3 text-caption font-semibold", view === "original" ? "bg-ink text-paper" : "text-soft")}>
                Original
              </button>
            </div>
          ) : null}
          <PaperStage>
            <LivePaper className="mx-0 shadow-chambers" resume={view === "original" && snapshot ? snapshot : undefined} />
          </PaperStage>
        </section>
        <aside className={cn("no-print max-h-[calc(100vh-8rem)] overflow-y-auto border-l border-hair bg-paper px-4 py-6", tab === "check" ? "block" : "hidden lg:block")}>
          <p className="kicker mb-5">Check</p>
          <LiveMatch />
          <ScoreCta />
          <TailorNotesCard />
        </aside>
      </div>
    </div>
  );
}

function MasterActions() {
  const snapshot = useResumeStore((s) => s.snapshot);
  const restoreMaster = useResumeStore((s) => s.restoreMaster);
  const saveMaster = useResumeStore((s) => s.saveMaster);
  const undoTailor = useResumeStore((s) => s.undoTailor);
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      <Button size="sm" variant="soft" onClick={() => { saveMaster(); toast.success("Saved as master"); }}>
        Save as master
      </Button>
      <Button size="sm" variant="ghost" onClick={restoreMaster}>
        Restore master
      </Button>
      {snapshot ? (
        <Button size="sm" variant="ghost" onClick={undoTailor}>
          <History className="size-4" /> Undo tailor
        </Button>
      ) : null}
    </div>
  );
}

function ScoreCta() {
  const jobDescription = useResumeStore((s) => s.jobDescription);
  if (jobDescription.trim()) return null;
  return (
    <Button asChild className="mt-5" size="sm">
      <Link to="/tailor">Score against a posting</Link>
    </Button>
  );
}

function TailorNotesCard() {
  const notes = useResumeStore((s) => s.notes);
  if (!notes) return null;
  return <NotesCard notes={notes} title="Last tailor" className="mt-6 p-4 text-caption" />;
}

function ToolLink({ to, icon: Icon, label }: { to: "/tools" | "/tailor" | "/templates"; icon: typeof PenLine; label: string }) {
  return (
    <Link to={to} className="inline-flex h-11 items-center gap-2 rounded-pill px-3 text-caption font-semibold text-soft hover:bg-fog hover:text-ink">
      <Icon className="size-4" />
      {label}
    </Link>
  );
}

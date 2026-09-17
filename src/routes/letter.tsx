import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { LiveLetter } from "@/components/letter/live-letter";
import { AppNav } from "@/components/layout/nav";
import { PageSkeleton } from "@/components/layout/skeleton";
import { PaperStage } from "@/components/resume/paper-stage";
import { PrintButton } from "@/components/resume/print-button";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { useHydrated } from "@/hooks/use-hydrated";
import { raceAi } from "@/lib/ai/timeout";
import { writeCoverLetterAi } from "@/lib/ai/resume-ai";
import { wordCount } from "@/lib/resume/quality";
import { LETTER_TONES, type LetterTone } from "@/lib/resume/types";
import { writeLetterLocal } from "@/lib/resume/letter-local";
import { useResumeStore } from "@/lib/resume/store";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/letter")({
  component: LetterPage,
  head: () => ({ meta: [{ title: "Letter · Chambers" }] }),
});

const TONE_COPY: Record<LetterTone, string> = {
  calm: "Measured",
  direct: "Short",
  warm: "Human",
};

function LetterPage() {
  const ready = useHydrated();
  if (!ready) return <PageSkeleton label="Loading letter" />;

  return (
    <div className="min-h-screen bg-fog">
      <AppNav />
      <div
        id="main"
        className="mx-auto grid max-w-page gap-8 px-5 py-8 lg:grid-cols-[minmax(280px,400px)_minmax(0,1fr)] md:px-8"
      >
        <LetterForm />
        <div>
          <PaperStage tools="letter">
            <LiveLetter />
          </PaperStage>
        </div>
      </div>
    </div>
  );
}

function LetterForm() {
  const resume = useResumeStore((s) => s.resume);
  const letter = useResumeStore((s) => s.letter);
  const setLetter = useResumeStore((s) => s.setLetter);
  const jobDescription = useResumeStore((s) => s.jobDescription);
  const targetCompany = useResumeStore((s) => s.targetCompany);
  const targetRole = useResumeStore((s) => s.targetRole);
  const setTarget = useResumeStore((s) => s.setTarget);
  const letterTone = useResumeStore((s) => s.letterTone);
  const setLetterTone = useResumeStore((s) => s.setLetterTone);
  const [busy, setBusy] = useState<"write" | "refine" | null>(null);

  const generate = async () => {
    const local = writeLetterLocal(
      resume,
      jobDescription,
      targetCompany,
      targetRole,
      letterTone,
    );
    setLetter(local);
    setBusy("refine");
    const ai = await raceAi(
      writeCoverLetterAi({
        data: {
          resume,
          jobDescription: jobDescription || "General application.",
          company: targetCompany,
          role: targetRole,
        },
      }),
      10000,
    );
    if (ai?.ok) {
      setLetter(ai.letter);
      toast.success("Letter drafted");
    } else {
      toast.message("Local draft — assistant unavailable.");
    }
    setBusy(null);
  };

  const body = letter.paragraphs.join("\n\n");
  const words = wordCount(`${letter.greeting} ${body} ${letter.closing}`);

  return (
    <div className="no-print">
      <span className="kicker">Cover letter</span>
      <h1 className="font-serif mt-3 text-3xl font-medium tracking-[-0.03em]">
        Same voice as the sheet
      </h1>
      <p className="mt-2 text-body text-soft">
        Instant local draft, then an optional refine. One page. Grounded in the resume.
      </p>
      <div className="mt-6 flex flex-col gap-3">
        <Field label="Company">
          <Input
            value={targetCompany}
            onChange={(e) => {
              setTarget(e.target.value, targetRole);
              setLetter({ ...letter, company: e.target.value });
            }}
          />
        </Field>
        <Field label="Role">
          <Input
            value={targetRole}
            onChange={(e) => {
              setTarget(targetCompany, e.target.value);
              setLetter({ ...letter, role: e.target.value });
            }}
          />
        </Field>
        <div>
          <p className="mb-2 text-micro font-semibold uppercase tracking-[0.12em] text-soft">
            Tone
          </p>
          <div className="flex w-fit rounded-pill border border-hair p-0.5" role="group" aria-label="Letter tone">
            {LETTER_TONES.map((tone) => (
              <button
                key={tone}
                type="button"
                onClick={() => setLetterTone(tone)}
                className={cn(
                  "h-9 rounded-pill px-3 text-caption font-semibold capitalize",
                  letterTone === tone ? "bg-ink text-paper" : "text-soft",
                )}
                aria-pressed={letterTone === tone}
              >
                {TONE_COPY[tone]}
              </button>
            ))}
          </div>
        </div>
        <Field label="Greeting">
          <Input
            value={letter.greeting}
            onChange={(e) => setLetter({ ...letter, greeting: e.target.value })}
          />
        </Field>
        <Field label="Body">
          <Textarea
            className="min-h-56"
            value={body}
            onChange={(e) =>
              setLetter({
                ...letter,
                paragraphs: e.target.value
                  .split(/\n{2,}/)
                  .map((p) => p.trim())
                  .filter(Boolean),
              })
            }
          />
          <p className="mt-1.5 text-xs tabular-nums text-soft">
            {words} words{words > 320 ? " — trim toward one page" : words > 0 && words < 90 ? " — a little thin" : ""}
          </p>
        </Field>
        <Field label="Closing">
          <Input
            value={letter.closing}
            onChange={(e) => setLetter({ ...letter, closing: e.target.value })}
          />
        </Field>
        <div className="flex flex-wrap gap-2 pt-2">
          <Button disabled={busy !== null} onClick={() => void generate()}>
            {busy === "refine" ? "Refining…" : "Generate letter"}
          </Button>
          <PrintButton label="Print letter" />
        </div>
      </div>
    </div>
  );
}

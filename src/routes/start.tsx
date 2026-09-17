import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Clipboard, Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BrandMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { raceAi } from "@/lib/ai/timeout";
import { parseResumeAi } from "@/lib/ai/resume-ai";
import { ingestResumeInput } from "@/lib/resume/ingest";
import { emptyResume, sampleEngineerResume, sampleResume } from "@/lib/resume/sample";
import { useResumeStore } from "@/lib/resume/store";
import { cn } from "@/lib/cn";
import { useHydrated } from "@/hooks/use-hydrated";

export const Route = createFileRoute("/start")({
  component: StartPage,
  head: () => ({ meta: [{ title: "Start · Chambers" }] }),
});

function StartPage() {
  useHydrated();
  const navigate = useNavigate();
  const resetSample = useResumeStore((s) => s.resetSample);
  const setResume = useResumeStore((s) => s.setResume);
  const saveMaster = useResumeStore((s) => s.saveMaster);
  const applyPack = useResumeStore((s) => s.applyPack);
  const [step, setStep] = useState(0);
  const [raw, setRaw] = useState("");
  const [busy, setBusy] = useState(false);

  const loadSample = (kind: "editorial" | "engineer") => {
    resetSample(kind === "engineer" ? sampleEngineerResume() : sampleResume());
    toast.success("Sample loaded into the studio");
    void navigate({ to: "/studio" });
  };

  const startBlank = () => {
    resetSample(emptyResume());
    toast.success("Blank sheet — fill in your facts");
    void navigate({ to: "/studio" });
  };

  const ingest = async () => {
    const text = raw.trim();
    if (text.length < 8) {
      toast.error("Paste a little more — a name and a role at least.");
      return;
    }
    setBusy(true);
    const result = ingestResumeInput(text);
    if (result.source === "json-pack") {
      applyPack(result.pack);
      toast.success("Chambers pack loaded");
      void navigate({ to: "/studio" });
      setBusy(false);
      return;
    }
    if (result.source === "json-resume") {
      setResume(result.resume);
      saveMaster();
      toast.success("JSON Resume loaded");
      void navigate({ to: "/studio" });
      setBusy(false);
      return;
    }
    if (text.length < 20) {
      toast.error("Paste a little more — a name and a role at least.");
      setBusy(false);
      return;
    }
    setResume(result.resume);
    saveMaster();
    toast.message("On paper. Refining structure…");
    void navigate({ to: "/studio" });
    const ai = await raceAi(parseResumeAi({ data: { text } }), 12000);
    if (ai?.ok) {
      setResume(ai.resume);
      saveMaster();
      toast.success("Structured with the assistant");
    }
    setBusy(false);
  };

  const onFile = async (file: File) => {
    const jsonish =
      file.name.match(/\.json$/i) ||
      file.type.includes("json") ||
      file.name.match(/\.(txt|md|text)$/i) ||
      !file.type ||
      file.type.startsWith("text");
    if (!jsonish) {
      toast.error("Use a .txt, .md, or .json file — or paste the text.");
      return;
    }
    const text = await file.text();
    setRaw(text);
    setStep(1);
  };

  const pasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        toast.error("Clipboard is empty.");
        return;
      }
      setRaw(text);
      setStep(1);
    } catch {
      toast.error("Could not read the clipboard.");
    }
  };

  return (
    <div className="min-h-screen bg-paper">
      <header className="flex h-14 items-center justify-between px-5">
        <BrandMark size="sm" />
        <Link to="/studio" className="text-sm font-medium text-soft hover:text-ink">
          I'll explore the studio first
        </Link>
      </header>
      <main id="main" className="mx-auto flex max-w-lg flex-col items-center px-5 py-12 text-center">
        <div className="mb-8 flex w-full max-w-xs gap-1">
          {[0, 1, 2].map((i) => (
            <b
              key={i}
              className={cn("h-1 flex-1 rounded-pill", i <= step ? "bg-vermilion" : "bg-hair")}
            />
          ))}
        </div>
        <p className="text-caption font-medium text-soft">Step {step + 1} of 3 · about a minute</p>

        {step === 0 && (
          <>
            <h1 className="font-serif mt-10 text-3xl font-medium tracking-[-0.03em] md:text-4xl">
              Do you have an existing resume to start from?
            </h1>
            <div className="mt-10 flex w-full flex-col gap-3">
              <Button size="lg" className="w-full" onClick={() => setStep(1)}>
                Yes — paste or upload
              </Button>
              <Button size="lg" variant="ghost" className="w-full" onClick={startBlank}>
                Start with a blank sheet
              </Button>
              <Button size="lg" variant="ghost" className="w-full" onClick={() => setStep(2)}>
                Not yet — start from a sample
              </Button>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h1 className="font-serif mt-10 text-3xl font-medium tracking-[-0.03em]">
              Paste the resume. We'll put it on paper.
            </h1>
            <Textarea
              className="mt-8 min-h-48 text-left"
              placeholder="Name, headline, roles, bullets… or a Chambers / JSON Resume file"
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
            />
            <div className="mt-3 flex flex-wrap items-center justify-center gap-4">
              <label className="block min-h-11 cursor-pointer text-sm font-medium text-ember">
                Choose a .txt or .json file
                <input
                  type="file"
                  accept=".txt,.md,.json,text/plain,application/json"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void onFile(f);
                  }}
                />
              </label>
              <button
                type="button"
                className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-ember"
                onClick={() => void pasteClipboard()}
              >
                <Clipboard className="size-3.5" /> Paste from clipboard
              </button>
            </div>
            <Button size="lg" className="mt-6 w-full" disabled={busy} onClick={() => void ingest()}>
              {busy ? "Reading…" : "Build the sheet"} <ArrowRight className="size-4" />
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="font-serif mt-10 text-3xl font-medium tracking-[-0.03em]">
              Start from a finished sample.
            </h1>
            <p className="mt-3 text-body text-soft">
              Editorial systems or staff engineering — both print-ready, both honest.
            </p>
            <div className="mt-8 flex w-full flex-col gap-3">
              <Button size="lg" className="w-full" onClick={() => loadSample("editorial")}>
                Avery Lang · editorial systems
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="w-full"
                onClick={() => loadSample("engineer")}
              >
                Maya Chen · staff frontend
              </Button>
            </div>
          </>
        )}

        <p className="mt-10 flex items-center gap-2 text-caption text-soft">
          <Lock className="size-3.5" />
          Private by default. Stored in this browser, not on a server.
        </p>
      </main>
    </div>
  );
}

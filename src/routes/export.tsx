import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Minus } from "lucide-react";
import { toast } from "sonner";
import { AppNav } from "@/components/layout/nav";
import { PageSkeleton } from "@/components/layout/skeleton";
import { PrintButton } from "@/components/resume/print-button";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/hooks/use-hydrated";
import { downloadBytes, letterDocx, resumeDocx, slugName } from "@/lib/resume/export-docx";
import { copyText, downloadText, letterAsText, resumeAsMarkdown, resumeAsText } from "@/lib/resume/export-text";
import { looksLikeEmail } from "@/lib/resume/quality";
import { scoreAts } from "@/lib/resume/ats";
import { toJsonResume } from "@/lib/resume/json-io";
import { useResumeStore } from "@/lib/resume/store";

export const Route = createFileRoute("/export")({
  component: ExportPage,
  head: () => ({ meta: [{ title: "Export · Chambers" }] }),
});

function ExportPage() {
  const ready = useHydrated();
  if (!ready) return <PageSkeleton label="Preparing export" />;
  return (
    <div className="min-h-screen bg-paper">
      <AppNav />
      <main id="main" className="mx-auto max-w-page px-5 py-12 md:px-8">
        <span className="kicker">Export</span>
        <h1 className="font-serif mt-3 text-3xl font-medium tracking-[-0.03em] md:text-5xl">
          Take the paper with you.
        </h1>
        <p className="mt-4 max-w-xl text-body text-soft">
          Print to PDF from the browser. Download Word or a Chambers JSON pack you can re-import later.
        </p>
        <ReadyList />
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <ResumeExport />
          <LetterExport />
        </div>
        <PackExport />
      </main>
    </div>
  );
}

function ReadyList() {
  const resume = useResumeStore((s) => s.resume);
  const jobDescription = useResumeStore((s) => s.jobDescription);
  const letter = useResumeStore((s) => s.letter);
  const report = jobDescription.trim() ? scoreAts(resume, jobDescription) : null;
  const items = [
    { ok: Boolean(resume.identity.name.trim()), label: "Name on the sheet" },
    { ok: looksLikeEmail(resume.identity.email) && Boolean(resume.identity.email.trim()), label: "Reachable email" },
    { ok: resume.experience.some((j) => j.role.trim() && j.bullets.some((b) => b.trim())), label: "At least one evidenced role" },
    { ok: resume.skills.filter(Boolean).length >= 6, label: "Skills list" },
    { ok: Boolean(jobDescription.trim()), label: "Posting on file" },
    { ok: report ? report.score >= 55 : false, label: report ? `Match ${report.score}` : "Match score" },
    { ok: letter.paragraphs.some((p) => p.trim()), label: "Cover letter drafted" },
  ];
  return (
    <ul className="mt-8 flex flex-wrap gap-2">
      {items.map((it) => (
        <li
          key={it.label}
          className={`inline-flex h-8 items-center rounded-pill border px-3 text-caption ${
            it.ok ? "border-hair bg-fog text-ink" : "border-dashed border-hair text-soft"
          }`}
        >
          {it.ok ? <Check className="mr-1.5 size-3.5 text-ember" /> : <Minus className="mr-1.5 size-3.5 text-faint" />}
          {it.label}
        </li>
      ))}
    </ul>
  );
}

function ResumeExport() {
  const resume = useResumeStore((s) => s.resume);
  const slug = slugName(resume.identity.name, "resume");
  return (
    <section className="hairline rounded-lg p-5">
      <h2 className="font-display text-[22px] font-semibold tracking-[-0.03em]">Resume</h2>
      <p className="mt-2 text-body text-soft">The current sheet. Print uses US Letter.</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <PrintButton />
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            void copyText(resumeAsText(resume)).then((ok) =>
              toast[ok ? "success" : "error"](ok ? "Copied resume" : "Could not copy"),
            )
          }
        >
          Copy text
        </Button>
        <Button variant="ghost" size="sm" onClick={() => downloadText(`${slug}.txt`, resumeAsText(resume))}>
          .txt
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => downloadText(`${slug}.md`, resumeAsMarkdown(resume))}
        >
          Markdown
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            downloadText(`${slug}-json-resume.json`, JSON.stringify(toJsonResume(resume), null, 2))
          }
        >
          JSON Resume
        </Button>
        <Button
          variant="ink"
          size="sm"
          onClick={() =>
            downloadBytes(
              `${slug}.docx`,
              resumeDocx(resume),
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            )
          }
        >
          Word .docx
        </Button>
      </div>
    </section>
  );
}

function LetterExport() {
  const letter = useResumeStore((s) => s.letter);
  const name = useResumeStore((s) => s.resume.identity.name);
  const slug = `${slugName(name, "letter")}-letter`;
  const empty = letter.paragraphs.filter(Boolean).length === 0;
  return (
    <section className="hairline rounded-lg p-5">
      <h2 className="font-display text-[22px] font-semibold tracking-[-0.03em]">Cover letter</h2>
      <p className="mt-2 text-body text-soft">
        {empty ? "No letter yet — generate one from Tailor or Letter." : `${letter.role || "Letter"} at ${letter.company || "the company"}.`}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button asChild size="sm" variant="ghost">
          <Link to="/letter">Open letter</Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={empty}
          onClick={() =>
            void copyText(letterAsText(letter, name)).then((ok) =>
              toast[ok ? "success" : "error"](ok ? "Copied letter" : "Could not copy"),
            )
          }
        >
          Copy text
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={empty}
          onClick={() => downloadText(`${slug}.txt`, letterAsText(letter, name))}
        >
          .txt
        </Button>
        <Button
          variant="ink"
          size="sm"
          disabled={empty}
          onClick={() =>
            downloadBytes(
              `${slug}.docx`,
              letterDocx(letter, name),
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            )
          }
        >
          Word .docx
        </Button>
      </div>
    </section>
  );
}

function PackExport() {
  const exportPack = useResumeStore((s) => s.exportPack);
  const applyPack = useResumeStore((s) => s.applyPack);
  const setResume = useResumeStore((s) => s.setResume);
  const saveMaster = useResumeStore((s) => s.saveMaster);
  return (
    <section className="hairline mt-6 rounded-lg p-5">
      <h2 className="font-display text-[22px] font-semibold tracking-[-0.03em]">Chambers JSON pack</h2>
      <p className="mt-2 max-w-2xl text-body text-soft">
        Resume, paper, posting, letter, and notes in one file. Re-import from Start or here. Stays on this device.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={() => {
            const pack = exportPack();
            downloadText(
              `${slugName(pack.resume.identity.name, "chambers")}.json`,
              JSON.stringify(pack, null, 2),
            );
            toast.success("JSON pack downloaded");
          }}
        >
          Download pack
        </Button>
        <label className="inline-flex h-9 cursor-pointer items-center rounded-pill border border-hair px-4 text-caption font-medium">
          Import pack
          <input
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (!f) return;
              try {
                const text = await f.text();
                const { importAnyJson } = await import("@/lib/resume/json-io");
                const result = importAnyJson(text);
                if (!result) {
                  toast.error("Not a Chambers pack or JSON Resume.");
                  return;
                }
                if (result.kind === "pack") applyPack(result.pack);
                else {
                  setResume(result.resume);
                  saveMaster();
                }
                toast.success("Loaded into the studio");
              } catch {
                toast.error("Could not read that file.");
              }
            }}
          />
        </label>
      </div>
    </section>
  );
}

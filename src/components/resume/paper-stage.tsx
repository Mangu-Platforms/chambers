import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Copy, Download } from "lucide-react";
import { useResumeStore } from "@/lib/resume/store";
import { copyText, downloadText, letterAsText, resumeAsText } from "@/lib/resume/export-text";
import { estimatePages, lengthLabel } from "@/lib/resume/length";
import { TEMPLATES } from "@/lib/resume/templates";
import { cn } from "@/lib/cn";

const SHEET = 816;
const PAGE = 1056;

export function PaperStage({
  children,
  tools = "resume",
}: {
  children: ReactNode;
  tools?: "resume" | "fit" | "letter";
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(true);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState(640);
  const [overflows, setOverflows] = useState(false);

  const measure = useCallback(() => {
    const frame = frameRef.current;
    const inner = innerRef.current;
    if (!frame || !inner) return;
    const next = fit ? Math.min(1, Math.max(0.35, frame.clientWidth / SHEET)) : 1;
    const content = Math.max(inner.scrollHeight, inner.offsetHeight, PAGE);
    setScale(next);
    setHeight(content * next);
    setOverflows(content > PAGE + 8);
  }, [fit]);

  useLayoutEffect(() => {
    measure();
    const frame = frameRef.current;
    const inner = innerRef.current;
    if (!frame || !inner) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(frame);
    ro.observe(inner);
    const t = window.setTimeout(measure, 50);
    return () => {
      ro.disconnect();
      window.clearTimeout(t);
    };
  }, [measure]);

  return (
    <div>
      {tools === "resume" ? (
        <PaperChrome fit={fit} onFit={setFit} />
      ) : tools === "letter" ? (
        <LetterChrome fit={fit} onFit={setFit} />
      ) : (
        <div className="no-print mb-4">
          <FitToggle fit={fit} onFit={setFit} />
        </div>
      )}
      <div
        ref={frameRef}
        className="paper-stage-frame relative w-full overflow-x-auto overflow-y-hidden"
        style={{ height }}
      >
        <div
          ref={innerRef}
          className="paper-stage-inner absolute top-0"
          style={{
            width: SHEET,
            left: "50%",
            marginLeft: -SHEET / 2,
            transform: `scale(${scale})`,
            transformOrigin: "top center",
          }}
        >
          {children}
          {overflows ? (
            <div
              className="no-print pointer-events-none absolute inset-x-3 z-10 border-t border-dashed border-vermilion/50"
              style={{ top: PAGE }}
            >
              <span className="absolute right-0 -top-2.5 rounded-pill bg-fog px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-ember">
                Page 2
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function FitToggle({ fit, onFit }: { fit: boolean; onFit: (v: boolean) => void }) {
  return (
    <div className="flex w-fit rounded-pill border border-hair p-0.5">
      <button
        type="button"
        onClick={() => onFit(true)}
        className={`h-8 rounded-pill px-3 text-caption font-semibold ${fit ? "bg-ink text-paper" : "text-soft"}`}
      >
        Fit
      </button>
      <button
        type="button"
        onClick={() => onFit(false)}
        className={`h-8 rounded-pill px-3 text-caption font-semibold ${!fit ? "bg-ink text-paper" : "text-soft"}`}
      >
        100%
      </button>
    </div>
  );
}

function LetterChrome({ fit, onFit }: { fit: boolean; onFit: (v: boolean) => void }) {
  const letter = useResumeStore((s) => s.letter);
  const resume = useResumeStore((s) => s.resume);

  const copy = async () => {
    const ok = await copyText(letterAsText(letter, resume.identity.name));
    toast[ok ? "success" : "error"](ok ? "Copied letter" : "Could not copy");
  };

  const download = () => {
    const name = (resume.identity.name || "letter").toLowerCase().replace(/\s+/g, "-");
    downloadText(`${name}-letter.txt`, letterAsText(letter, resume.identity.name));
  };

  return (
    <div className="no-print mb-4 flex flex-wrap items-center gap-2">
      <FitToggle fit={fit} onFit={onFit} />
      <span className="ml-auto flex gap-1">
        <button
          type="button"
          onClick={() => void copy()}
          className="inline-flex h-9 items-center gap-1.5 rounded-pill px-3 text-caption font-semibold text-soft hover:text-ink"
        >
          <Copy className="size-3.5" /> Copy text
        </button>
        <button
          type="button"
          onClick={download}
          className="inline-flex h-9 items-center gap-1.5 rounded-pill px-3 text-caption font-semibold text-soft hover:text-ink"
        >
          <Download className="size-3.5" /> .txt
        </button>
      </span>
    </div>
  );
}

function PaperChrome({ fit, onFit }: { fit: boolean; onFit: (v: boolean) => void }) {
  const templateId = useResumeStore((s) => s.templateId);
  const setTemplate = useResumeStore((s) => s.setTemplate);
  const resume = useResumeStore((s) => s.resume);
  const pages = estimatePages(resume, templateId);
  const label = lengthLabel(pages);

  const copy = async () => {
    const ok = await copyText(resumeAsText(resume));
    toast[ok ? "success" : "error"](ok ? "Copied as plain text" : "Could not copy");
  };

  const download = () => {
    const name = (resume.identity.name || "resume").toLowerCase().replace(/\s+/g, "-");
    downloadText(`${name}.txt`, resumeAsText(resume));
  };

  return (
    <div className="no-print mb-4 flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-1">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTemplate(t.id)}
            className={cn(
              "h-9 rounded-pill px-3 text-caption font-semibold transition-[color,background-color] duration-150",
              t.id === templateId ? "bg-ink text-paper" : "text-soft hover:text-ink",
            )}
            aria-pressed={t.id === templateId}
          >
            {t.name}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-caption text-soft">
        <FitToggle fit={fit} onFit={onFit} />
        <span className={cn("tabular-nums", pages > 1.05 ? "text-ember" : "")}>
          {label}
          {pages > 1 ? ` · ${pages.toFixed(1)}` : ""}
        </span>
        <span className="ml-auto flex gap-1">
          <button
            type="button"
            onClick={() => void copy()}
            className="inline-flex h-9 items-center gap-1.5 rounded-pill px-3 font-semibold text-soft hover:text-ink"
          >
            <Copy className="size-3.5" /> Copy text
          </button>
          <button
            type="button"
            onClick={download}
            className="inline-flex h-9 items-center gap-1.5 rounded-pill px-3 font-semibold text-soft hover:text-ink"
          >
            <Download className="size-3.5" /> .txt
          </button>
        </span>
      </div>
    </div>
  );
}

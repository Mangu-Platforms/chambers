import type { TailorNotes } from "@/lib/resume/types";
import { cn } from "@/lib/cn";

export function NotesCard({ notes, className, title = "What changed" }: { notes: TailorNotes; className?: string; title?: string }) {
  const items = [...notes.moved, ...notes.rewrote];
  return (
    <div className={cn("hairline rounded-lg bg-paper p-5 text-body", className)}>
      <p className="font-semibold tracking-[-0.02em]">{title}</p>
      <p className="mt-2 text-soft">{notes.summary}</p>
      {items.length > 0 && (
        <ul className="mt-3 list-disc pl-5 text-soft">
          {items.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      )}
      {notes.missing.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-micro font-semibold uppercase tracking-[0.12em] text-soft">Still not evidenced</p>
          <div className="flex flex-wrap gap-1.5">
            {notes.missing.slice(0, 12).map((k) => (
              <span key={k} className="inline-flex h-7 items-center rounded-pill border border-hair px-2.5 text-[11px]">
                {k}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

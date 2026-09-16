import { memo, useMemo } from "react";
import { Check, Minus } from "lucide-react";
import { scoreAts, scoreLabel } from "@/lib/resume/ats";
import type { Resume } from "@/lib/resume/types";

export const MatchPanel = memo(function MatchPanel({
  resume,
  jobDescription,
  baseline,
}: {
  resume: Resume;
  jobDescription: string;
  baseline?: number | null;
}) {
  const report = useMemo(() => scoreAts(resume, jobDescription), [resume, jobDescription]);
  const delta = baseline != null && baseline !== report.score ? report.score - baseline : null;
  return (
    <div className="text-ink">
      <div className="flex items-center gap-5">
        <div
          className="grid size-[88px] shrink-0 place-items-center rounded-full"
          style={{
            background: `conic-gradient(var(--color-vermilion) ${Math.max(0, Math.min(100, report.score))}%, var(--color-hair) 0)`,
          }}
        >
          <div className="grid size-[68px] place-items-center rounded-full bg-paper">
            <b className="text-[20px] font-semibold tracking-[-0.03em] tabular-nums">{report.score}</b>
          </div>
        </div>
        <div>
          <p className="kicker">Match</p>
          <p className="mt-1 font-display text-[22px] font-semibold tracking-[-0.03em]">{scoreLabel(report.score)}</p>
          <p className="mt-1 text-sm text-soft">
            {report.matched.length} posting phrases present · {report.missing.length} still open
            {delta != null ? (
              <span className="ml-2 tabular-nums text-ember">
                {delta > 0 ? "+" : ""}
                {delta} vs original
              </span>
            ) : null}
          </p>
        </div>
      </div>
      <ul className="mt-5 flex flex-col gap-2">
        {report.checks.map((c) => (
          <li key={c.id} className="flex items-start gap-2 text-caption">
            {c.pass ? <Check className="mt-0.5 size-4 shrink-0 text-ember" /> : <Minus className="mt-0.5 size-4 shrink-0 text-faint" />}
            <span>
              <b className="font-medium">{c.label}.</b> <span className="text-soft">{c.detail}</span>
            </span>
          </li>
        ))}
      </ul>
      {report.missing.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-micro font-semibold uppercase tracking-[0.12em] text-soft">Not evidenced — do not invent</p>
          <div className="flex flex-wrap gap-1.5">
            {report.missing.slice(0, 10).map((k) => (
              <span key={k} className="inline-flex h-7 items-center rounded-pill border border-hair px-2.5 text-[11px]">
                {k}
              </span>
            ))}
          </div>
        </div>
      )}
      {report.matched.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-micro font-semibold uppercase tracking-[0.12em] text-soft">Already in your voice</p>
          <div className="flex flex-wrap gap-1.5">
            {report.matched.slice(0, 10).map((k) => (
              <span key={k} className="inline-flex h-7 items-center rounded-pill border border-hair bg-blush-soft px-2.5 text-[11px] text-ember">
                {k}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

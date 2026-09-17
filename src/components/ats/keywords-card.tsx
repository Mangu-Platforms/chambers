import { toast } from "sonner";
import { classifyKeywords } from "@/lib/resume/keywords";
import { useResumeStore } from "@/lib/resume/store";

export function KeywordsCard({ className = "" }: { className?: string }) {
  const resume = useResumeStore((s) => s.resume);
  const jobDescription = useResumeStore((s) => s.jobDescription);
  const promoteSkill = useResumeStore((s) => s.promoteSkill);
  if (!jobDescription.trim()) {
    return (
      <div className={`hairline rounded-lg bg-paper p-4 ${className}`}>
        <p className="kicker">Keyword fit</p>
        <p className="mt-2 text-caption text-soft">
          Paste a posting in Tailor to see which phrases are already evidenced.
        </p>
      </div>
    );
  }
  const { inSkills, inBody, missing, coverage } = classifyKeywords(resume, jobDescription);

  return (
    <div className={`hairline rounded-lg bg-paper p-4 ${className}`}>
      <p className="kicker">Keyword fit</p>
      <p className="mt-2 font-display text-[18px] font-semibold tracking-[-0.03em] tabular-nums">
        {coverage}% evidenced
      </p>
      <p className="mt-1 text-caption text-soft">
        Promote phrases already in the work. Missing ones stay missing — never invent them.
      </p>

      {inBody.length > 0 ? (
        <div className="mt-4">
          <p className="mb-2 text-micro font-semibold uppercase tracking-[0.12em] text-soft">
            In the work · add to skills
          </p>
          <div className="flex flex-wrap gap-1.5">
            {inBody.slice(0, 12).map((term) => (
              <button
                key={term}
                type="button"
                className="inline-flex min-h-8 items-center rounded-pill border border-hair bg-blush-soft px-2.5 text-[11px] font-medium text-ember hover:border-vermilion"
                onClick={() => {
                  if (promoteSkill(term)) toast.success(`Added “${term}” to skills`);
                  else toast.message("Already listed, or not evidenced.");
                }}
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {inSkills.length > 0 ? (
        <div className="mt-4">
          <p className="mb-2 text-micro font-semibold uppercase tracking-[0.12em] text-soft">
            Already on the skills list
          </p>
          <div className="flex flex-wrap gap-1.5">
            {inSkills.slice(0, 10).map((term) => (
              <span
                key={term}
                className="inline-flex h-7 items-center rounded-pill border border-hair px-2.5 text-[11px]"
              >
                {term}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {missing.length > 0 ? (
        <div className="mt-4">
          <p className="mb-2 text-micro font-semibold uppercase tracking-[0.12em] text-soft">
            Not evidenced — do not invent
          </p>
          <div className="flex flex-wrap gap-1.5">
            {missing.slice(0, 10).map((term) => (
              <span
                key={term}
                className="inline-flex h-7 items-center rounded-pill border border-dashed border-hair px-2.5 text-[11px] text-soft"
              >
                {term}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

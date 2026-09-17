import { diffResumes } from "@/lib/resume/diff";
import type { Resume } from "@/lib/resume/types";

export function DiffCard({
  before,
  after,
  title = "Compared with original",
}: {
  before: Resume;
  after: Resume;
  title?: string;
}) {
  const d = diffResumes(before, after);
  const orderChanged = d.jobOrder.before.join("|") !== d.jobOrder.after.join("|");
  if (!orderChanged && d.bullets.length === 0) return null;
  return (
    <div className="hairline mt-6 rounded-lg bg-paper p-4 text-caption">
      <p className="font-semibold tracking-[-0.02em]">{title}</p>
      {orderChanged ? (
        <p className="mt-2 text-soft">
          Role order is now {d.jobOrder.after.filter(Boolean).slice(0, 3).join(" → ") || "unchanged"}.
        </p>
      ) : null}
      {d.bullets.length > 0 ? (
        <ul className="mt-2 list-disc pl-5 text-soft">
          {d.bullets.slice(0, 6).map((b) => (
            <li key={`${b.kind}-${b.text.slice(0, 24)}`}>
              {b.kind === "raised" ? "Raised" : "Rewrote"} under {b.role}.
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

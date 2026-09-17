import { useDeferredValue, useMemo } from "react";
import { MatchPanel } from "@/components/ats/match-panel";
import { scoreAts } from "@/lib/resume/ats";
import { useResumeStore } from "@/lib/resume/store";

export function LiveMatch({ variant = "light" }: { variant?: "light" | "dark" }) {
  const resume = useResumeStore((s) => s.resume);
  const jobDescription = useResumeStore((s) => s.jobDescription);
  const snapshot = useResumeStore((s) => s.snapshot);
  const deferredResume = useDeferredValue(resume);
  const deferredJd = useDeferredValue(jobDescription);
  const baseline = useMemo(
    () => (snapshot && deferredJd.trim() ? scoreAts(snapshot, deferredJd).score : null),
    [snapshot, deferredJd],
  );
  return (
    <MatchPanel
      resume={deferredResume}
      jobDescription={deferredJd}
      variant={variant}
      baseline={baseline}
    />
  );
}

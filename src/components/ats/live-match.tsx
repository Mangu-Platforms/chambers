import { useDeferredValue, useMemo } from "react";
import { MatchPanel } from "@/components/ats/match-panel";
import { scoreAts } from "@/lib/resume/ats";
import { useResumeStore } from "@/lib/resume/store";

export function LiveMatch() {
  const resume = useResumeStore((s) => s.resume);
  const jobDescription = useResumeStore((s) => s.jobDescription);
  const snapshot = useResumeStore((s) => s.snapshot);
  const deferredResume = useDeferredValue(resume);
  const deferredJd = useDeferredValue(jobDescription);
  const baseline = useMemo(
    () => (snapshot ? scoreAts(snapshot, deferredJd).score : null),
    [snapshot, deferredJd],
  );
  return <MatchPanel resume={deferredResume} jobDescription={deferredJd} baseline={baseline} />;
}

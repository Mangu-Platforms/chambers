import { useDeferredValue, useMemo } from "react";
import { HighlightProvider } from "@/components/resume/mark";
import { ResumeSheet } from "@/components/resume/sheet";
import { useResumeStore } from "@/lib/resume/store";
import { uniqueKeywords } from "@/lib/resume/text";
import type { Resume } from "@/lib/resume/types";
import { cn } from "@/lib/cn";

export function LivePaper({
  className,
  resume: override,
}: {
  className?: string;
  resume?: Resume;
}) {
  const storeResume = useResumeStore((s) => s.resume);
  const templateId = useResumeStore((s) => s.templateId);
  const density = useResumeStore((s) => s.density);
  const jobDescription = useResumeStore((s) => s.jobDescription);
  const resume = override ?? storeResume;
  const deferredResume = useDeferredValue(resume);
  const deferredTemplate = useDeferredValue(templateId);
  const terms = useMemo(
    () => (jobDescription.trim().length > 40 ? uniqueKeywords(jobDescription).slice(0, 18) : []),
    [jobDescription],
  );
  return (
    <HighlightProvider terms={terms}>
      <ResumeSheet
        resume={deferredResume}
        template={deferredTemplate}
        density={density}
        className={cn("mx-auto", className)}
      />
    </HighlightProvider>
  );
}

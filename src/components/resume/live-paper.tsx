import { useDeferredValue } from "react";
import { ResumeSheet } from "@/components/resume/sheet";
import { useResumeStore } from "@/lib/resume/store";
import type { Resume } from "@/lib/resume/types";
import { cn } from "@/lib/cn";

export function LivePaper({ className, resume: override }: { className?: string; resume?: Resume }) {
  const storeResume = useResumeStore((s) => s.resume);
  const templateId = useResumeStore((s) => s.templateId);
  const resume = useDeferredValue(override ?? storeResume);
  const template = useDeferredValue(templateId);
  return <ResumeSheet resume={resume} template={template} className={cn("mx-auto", className)} />;
}

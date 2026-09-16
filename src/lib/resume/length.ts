import type { Resume, TemplateId } from "./types";
import { resumePlainText } from "./text";

export function wordCount(resume: Resume): number {
  return resumePlainText(resume).split(/\s+/).filter(Boolean).length;
}

export function estimatePages(resume: Resume, template: TemplateId): number {
  const words = wordCount(resume);
  const cap =
    template === "compact" ? 680 : template === "editorial" ? 500 : template === "executive" ? 540 : 560;
  return Math.round((words / cap) * 10) / 10;
}

export function lengthLabel(pages: number): string {
  if (pages <= 1.05) return "One page";
  if (pages <= 1.4) return "Slightly long";
  return "Over one page";
}

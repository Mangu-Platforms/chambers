import { useDeferredValue } from "react";
import { LetterSheet } from "@/components/letter/letter-sheet";
import { useResumeStore } from "@/lib/resume/store";

export function LiveLetter() {
  const letter = useResumeStore((s) => s.letter);
  const resume = useResumeStore((s) => s.resume);
  const deferredLetter = useDeferredValue(letter);
  const deferredResume = useDeferredValue(resume);
  return <LetterSheet letter={deferredLetter} resume={deferredResume} />;
}

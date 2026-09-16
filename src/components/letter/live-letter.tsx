import { useDeferredValue } from "react";
import { LetterSheet } from "@/components/letter/letter-sheet";
import { useResumeStore } from "@/lib/resume/store";

export function LiveLetter() {
  const letter = useResumeStore((s) => s.letter);
  const resume = useResumeStore((s) => s.resume);
  return <LetterSheet letter={useDeferredValue(letter)} resume={useDeferredValue(resume)} />;
}

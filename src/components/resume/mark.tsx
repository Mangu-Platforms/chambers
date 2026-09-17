import { createContext, useContext, useMemo, type ReactNode } from "react";
import { highlightTerms } from "@/lib/resume/highlight";

const Terms = createContext<string[]>([]);

export function HighlightProvider({
  terms,
  children,
}: {
  terms: string[];
  children: ReactNode;
}) {
  return <Terms.Provider value={terms}>{children}</Terms.Provider>;
}

export function Mark({ text }: { text: string }) {
  const terms = useContext(Terms);
  const parts = useMemo(() => highlightTerms(text, terms), [text, terms]);
  if (!terms.length) return <>{text}</>;
  return (
    <>
      {parts.map((p, i) =>
        p.hit ? (
          <mark key={i} className="resume-hit">
            {p.text}
          </mark>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </>
  );
}

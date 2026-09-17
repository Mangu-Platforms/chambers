import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppNav } from "@/components/layout/nav";
import { PageSkeleton } from "@/components/layout/skeleton";
import { PaperThumb } from "@/components/resume/paper-thumb";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/hooks/use-hydrated";
import { useResumeStore } from "@/lib/resume/store";
import { TEMPLATES } from "@/lib/resume/templates";
import type { TemplateId } from "@/lib/resume/types";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/templates")({
  component: TemplatesPage,
  head: () => ({ meta: [{ title: "Paper · Chambers" }] }),
});

const FILTERS = ["All paper", "ATS first", "Leadership", "Magazine", "Traditional"] as const;

function TemplatesPage() {
  const ready = useHydrated();
  const templateId = useResumeStore((s) => s.templateId);
  const setTemplate = useResumeStore((s) => s.setTemplate);
  const navigate = useNavigate();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All paper");

  if (!ready) {
    return <PageSkeleton label="Loading paper" />;
  }

  const list = TEMPLATES.filter((t) => {
    if (filter === "All paper") return true;
    if (filter === "ATS first") return t.ats === "high";
    return t.tone === filter;
  });

  const useIt = (id: TemplateId) => {
    setTemplate(id);
    void navigate({ to: "/studio" });
  };

  return (
    <div className="min-h-screen bg-paper">
      <AppNav />
      <div id="main" className="mx-auto max-w-page px-5 py-12 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="kicker">Paper library</span>
          <h1 className="font-serif mt-4 text-3xl font-medium tracking-[-0.03em] md:text-5xl">
            Select a sheet. You can always change it later.
          </h1>
          <p className="mt-4 text-body text-soft">
            Six letter-width templates. The chosen card takes the only vermilion line.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "h-11 rounded-pill px-4 text-caption font-semibold transition-[background-color,color,border-color] duration-150",
                filter === f
                  ? "bg-ink text-paper"
                  : "border border-hair text-soft hover:text-ink",
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((t) => {
            const selected = t.id === templateId;
            return (
              <article
                key={t.id}
                className={cn(
                  "overflow-hidden rounded-lg bg-fog p-3 text-left",
                  selected ? "hairline-selected shadow-lift" : "hairline",
                )}
              >
                <button
                  type="button"
                  onClick={() => setTemplate(t.id)}
                  className="block w-full overflow-hidden rounded-md border border-hair bg-paper"
                  aria-label={`Select ${t.name} paper`}
                  aria-pressed={selected}
                >
                  <PaperThumb template={t.id} />
                </button>
                <div className="mt-3 flex items-start justify-between gap-2 px-1">
                  <div>
                    <h2 className="font-display text-xl font-semibold tracking-[-0.03em]">
                      {t.name}
                    </h2>
                    <p className="mt-1 text-caption text-soft">{t.blurb}</p>
                    <p className="mt-1 text-xs text-soft">
                      ATS {t.ats} · {t.bestFor}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => useIt(t.id)}>
                    Use
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

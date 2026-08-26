"use client";

import { use } from "react";
import Link from "next/link";
import { StudioHeader } from "@/components/StudioHeader";
import { EditorPanel } from "@/components/editor/EditorPanel";
import { ResumeSheet } from "@/components/sheet/ResumeSheet";
import { ButtonLink } from "@/components/ui/Button";
import { useDocument } from "@/lib/useDocument";
import { templateIds, type TemplateId } from "@/lib/resume/schema";

const templateNames: Record<TemplateId, string> = {
  classic: "Classic",
  compact: "Compact",
  executive: "Executive",
};

const saveLabels: Record<string, string> = {
  saved: "Saved",
  saving: "Saving…",
  error: "Save failed — retrying on next edit",
};

export default function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { doc, saveState, setTitle, setTemplate, setData } = useDocument(id);

  if (saveState === "missing") {
    return (
      <div className="min-h-screen">
        <StudioHeader />
        <main className="mx-auto max-w-md px-6 pt-24 text-center">
          <h1 className="text-title font-semibold tracking-tightish">Not here</h1>
          <p className="mt-2 text-body leading-relaxed text-muted">
            This document does not exist in this browser or account. It may have been deleted, or it
            lives somewhere you are not signed in.
          </p>
          <div className="mt-6 flex justify-center">
            <ButtonLink href="/app" variant="primary">
              Back to documents
            </ButtonLink>
          </div>
        </main>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="min-h-screen">
        <StudioHeader />
        <main className="mx-auto max-w-chambers px-6 pt-10">
          <div className="h-8 w-56 animate-pulse rounded-pill bg-white/70" />
          <div className="mt-8 h-[70vh] animate-pulse rounded-chambers border border-line bg-white/60" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <StudioHeader>
        <div className="flex min-w-0 items-center gap-3">
          <input
            aria-label="Document title"
            className="h-9 w-44 truncate rounded-chambers border border-transparent bg-transparent px-2 text-center text-body font-medium tracking-tightish hover:border-line focus:border-line focus:bg-white sm:w-64"
            value={doc.title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <span
            className={`hidden text-caption sm:inline ${saveState === "error" ? "text-vermilion-600" : "text-muted"}`}
            role="status"
          >
            {saveLabels[saveState] ?? ""}
          </span>
        </div>
      </StudioHeader>

      <div className="no-print border-b border-line bg-white">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-2.5 md:px-6">
          <div className="flex items-center gap-1" role="group" aria-label="Template">
            {templateIds.map((t) => (
              <button
                key={t}
                aria-pressed={doc.template === t}
                onClick={() => setTemplate(t)}
                className={`h-9 rounded-pill px-4 text-meta font-medium transition-colors ${
                  doc.template === t
                    ? "border-[1.5px] border-vermilion-600 text-ink"
                    : "border border-line text-muted hover:text-ink"
                }`}
              >
                {templateNames[t]}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/app/${doc.id}/export`}
              className="inline-flex h-9 items-center rounded-pill bg-vermilion-600 px-5 text-meta font-medium text-white transition-[filter] hover:brightness-95"
            >
              Export
            </Link>
          </div>
        </div>
      </div>

      <main className="mx-auto grid max-w-[1400px] gap-8 px-4 py-8 md:px-6 lg:grid-cols-[minmax(360px,44%)_1fr]">
        <div className="no-print min-w-0">
          <EditorPanel data={doc.data} setData={setData} />
        </div>
        <div className="print-stage min-w-0 lg:sticky lg:top-[7.5rem] lg:h-[calc(100vh-8.5rem)] lg:overflow-y-auto">
          <ResumeSheet data={doc.data} template={doc.template} />
          <p className="no-print mt-4 text-center text-meta text-muted">
            Live preview — identical to the exported PDF.
          </p>
        </div>
      </main>
    </div>
  );
}

"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { StudioHeader } from "@/components/StudioHeader";
import { ResumeSheet } from "@/components/sheet/ResumeSheet";
import { Button, ButtonLink } from "@/components/ui/Button";
import { getDocumentStore } from "@/lib/store";
import { resumeToPlainText } from "@/lib/export/text";
import { downloadBlob, exportFilename } from "@/lib/export/download";
import { generateSlug } from "@/lib/resume/slug";
import { appUrl } from "@/lib/env";
import type { StudioDocument } from "@/lib/resume/schema";

function ExportCard({
  title,
  body,
  actionLabel,
  onAction,
  busy,
  primary,
}: {
  title: string;
  body: string;
  actionLabel: string;
  onAction: () => void;
  busy?: boolean;
  primary?: boolean;
}) {
  return (
    <div className="flex flex-col justify-between rounded-chambers border border-line bg-white p-5 shadow-chambers">
      <div>
        <h2 className="text-lead font-semibold tracking-tightish">{title}</h2>
        <p className="mt-1.5 text-meta leading-relaxed text-muted">{body}</p>
      </div>
      <div className="mt-5">
        <Button variant={primary ? "primary" : "quiet"} onClick={onAction} disabled={busy}>
          {busy ? "Preparing…" : actionLabel}
        </Button>
      </div>
    </div>
  );
}

export default function ExportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [doc, setDoc] = useState<StudioDocument | null>(null);
  const [missing, setMissing] = useState(false);
  const [docxBusy, setDocxBusy] = useState(false);
  const [shareBusy, setShareBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const store = getDocumentStore();

  useEffect(() => {
    getDocumentStore()
      .get(id)
      .then((loaded) => (loaded ? setDoc(loaded) : setMissing(true)))
      .catch(() => setMissing(true));
  }, [id]);

  if (missing) {
    return (
      <div className="min-h-screen">
        <StudioHeader />
        <main className="mx-auto max-w-md px-6 pt-24 text-center">
          <h1 className="text-title font-semibold tracking-tightish">Not here</h1>
          <p className="mt-2 text-body text-muted">This document does not exist here.</p>
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
          <div className="h-64 animate-pulse rounded-chambers border border-line bg-white/60" />
        </main>
      </div>
    );
  }

  const shareLink = doc.isPublic && doc.slug ? `${appUrl()}/s/${doc.slug}` : null;

  return (
    <div className="min-h-screen">
      <StudioHeader>
        <span className="truncate text-body font-medium tracking-tightish">{doc.title}</span>
      </StudioHeader>

      <main className="mx-auto max-w-[1400px] px-4 py-8 md:px-6">
        <div className="no-print mb-8">
          <Link
            href={`/app/${doc.id}`}
            className="text-meta font-medium text-vermilion-600 underline-offset-4 hover:underline"
          >
            ← Back to the editor
          </Link>
          <h1 className="mt-2 font-display text-display font-semibold tracking-display">Export</h1>
          <p className="mt-1 text-body tracking-body text-muted">
            Three formats. The PDF is the sheet below, exactly.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <ExportCard
              primary
              title="PDF"
              body="Opens your browser's print dialog with the sheet as the page. Choose “Save as PDF” — margins and type match the preview one-for-one."
              actionLabel="Print / Save PDF"
              onAction={() => {
                void store.recordExport(doc.id, "pdf");
                window.print();
              }}
            />
            <ExportCard
              title="Plain text"
              body="ATS-clean single column: real headings, standard bullets, no styling to trip a parser."
              actionLabel="Download .txt"
              onAction={() => {
                const text = resumeToPlainText(doc.data);
                downloadBlob(
                  new Blob([text], { type: "text/plain;charset=utf-8" }),
                  exportFilename(doc.title, "txt"),
                );
                void store.recordExport(doc.id, "txt");
              }}
            />
            <ExportCard
              title="DOCX"
              body="A Word document with real heading styles and plain paragraphs — edits cleanly, parses cleanly."
              actionLabel="Download .docx"
              busy={docxBusy}
              onAction={async () => {
                setDocxBusy(true);
                try {
                  const { resumeToDocxBlob } = await import("@/lib/export/docx");
                  const blob = await resumeToDocxBlob(doc.data);
                  downloadBlob(blob, exportFilename(doc.title, "docx"));
                  void store.recordExport(doc.id, "docx");
                } finally {
                  setDocxBusy(false);
                }
              }}
            />
          </div>

          <div className="mt-6 rounded-chambers border border-line bg-white p-5 shadow-chambers">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lead font-semibold tracking-tightish">Share link</h2>
                <p className="mt-1 text-meta leading-relaxed text-muted">
                  {store.mode === "supabase"
                    ? "A read-only public page for this resume. Turn it off any time."
                    : "Sharing needs an account — this demo deployment keeps documents in your browser only."}
                </p>
              </div>
              {store.mode === "supabase" ? (
                <Button
                  disabled={shareBusy}
                  onClick={async () => {
                    setShareBusy(true);
                    try {
                      const updated = doc.isPublic
                        ? await store.update(doc.id, { isPublic: false })
                        : await store.update(doc.id, {
                            isPublic: true,
                            slug: doc.slug ?? generateSlug(),
                          });
                      setDoc(updated);
                    } finally {
                      setShareBusy(false);
                    }
                  }}
                >
                  {shareBusy ? "One moment…" : doc.isPublic ? "Turn sharing off" : "Create share link"}
                </Button>
              ) : null}
            </div>
            {shareLink ? (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <code className="rounded-chambers border border-line bg-fog px-3 py-2 text-meta">
                  {shareLink}
                </code>
                <button
                  className="text-meta font-medium text-vermilion-600 underline-offset-4 hover:underline"
                  onClick={async () => {
                    await navigator.clipboard.writeText(shareLink);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1800);
                  }}
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="print-stage">
          <ResumeSheet data={doc.data} template={doc.template} />
        </div>
      </main>
    </div>
  );
}

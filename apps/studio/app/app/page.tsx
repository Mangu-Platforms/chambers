"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { StudioHeader } from "@/components/StudioHeader";
import { Button } from "@/components/ui/Button";
import { getDocumentStore } from "@/lib/store";
import { sampleResume, SAMPLE_TITLE } from "@/lib/resume/sample";
import type { StudioDocument } from "@/lib/resume/schema";

const templateNames: Record<string, string> = {
  classic: "Classic letter",
  compact: "Compact",
  executive: "Executive",
};

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(ms / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function Dashboard() {
  const router = useRouter();
  const params = useSearchParams();
  const [docs, setDocs] = useState<StudioDocument[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const store = getDocumentStore();
      setDocs(await store.list());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load documents.");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createBlank = useCallback(async () => {
    setBusy(true);
    try {
      const doc = await getDocumentStore().create();
      router.push(`/app/${doc.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the document.");
      setBusy(false);
    }
  }, [router]);

  const createSample = useCallback(async () => {
    setBusy(true);
    try {
      const doc = await getDocumentStore().create({ title: SAMPLE_TITLE, data: sampleResume() });
      router.push(`/app/${doc.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the sample.");
      setBusy(false);
    }
  }, [router]);

  // /app?sample=1 — one-tap sample from marketing.
  useEffect(() => {
    if (params.get("sample") === "1" && docs !== null && !busy) {
      const existing = docs.find((d) => d.title === SAMPLE_TITLE);
      if (existing) router.replace(`/app/${existing.id}`);
      else void createSample();
    }
  }, [params, docs, busy, router, createSample]);

  async function remove(id: string) {
    if (!window.confirm("Delete this resume? This cannot be undone.")) return;
    try {
      await getDocumentStore().remove(id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete the document.");
    }
  }

  return (
    <div className="min-h-screen">
      <StudioHeader />
      <main className="mx-auto max-w-chambers px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-display font-semibold tracking-display">Documents</h1>
            <p className="mt-1 text-body tracking-body text-muted">
              Everything you are working on, most recent first.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={createSample} disabled={busy}>
              Load sample
            </Button>
            <Button variant="primary" onClick={createBlank} disabled={busy}>
              New resume
            </Button>
          </div>
        </div>

        {error ? (
          <p className="mt-6 rounded-chambers border border-line bg-white p-4 text-body text-vermilion-600" role="alert">
            {error}
          </p>
        ) : null}

        {docs === null ? (
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-36 animate-pulse rounded-chambers border border-line bg-white/60" />
            ))}
          </div>
        ) : docs.length === 0 ? (
          <div className="mt-10 rounded-chambers border border-line bg-white px-8 py-16 text-center shadow-chambers">
            <div className="mx-auto mb-6 h-24 w-[72px] rounded-[6px] border border-line bg-fog p-2">
              <div className="mb-1.5 h-2 w-10 rounded-sm bg-[rgba(255,77,0,0.35)]" />
              <div className="mb-1 h-1.5 w-12 rounded-sm bg-line" />
              <div className="mb-3 h-1.5 w-8 rounded-sm bg-line" />
              <div className="mb-1 h-1 w-full rounded-sm bg-fog brightness-95" />
            </div>
            <h2 className="text-title font-semibold tracking-tightish">A calm blank page</h2>
            <p className="mx-auto mt-2 max-w-sm text-body leading-relaxed tracking-body text-muted">
              Start from nothing, or open the sample to see how a finished sheet reads. You can
              switch templates at any point without losing a word.
            </p>
            <div className="mt-7 flex items-center justify-center gap-3">
              <Button variant="primary" onClick={createBlank} disabled={busy}>
                Start a resume
              </Button>
              <Button onClick={createSample} disabled={busy}>
                Open the sample
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {docs.map((doc) => (
              <div
                key={doc.id}
                className="group relative rounded-chambers border border-line bg-white p-5 shadow-chambers transition-colors hover:border-[rgba(255,77,0,0.72)]"
              >
                <button
                  className="block w-full text-left"
                  onClick={() => router.push(`/app/${doc.id}`)}
                >
                  <h2 className="truncate pr-8 text-lead font-semibold tracking-tightish">
                    {doc.title || "Untitled"}
                  </h2>
                  <p className="mt-1 text-meta text-muted">
                    {templateNames[doc.template] ?? doc.template} · edited {timeAgo(doc.updatedAt)}
                  </p>
                  <p className="mt-3 line-clamp-2 text-meta leading-relaxed text-muted">
                    {doc.data.profile.fullName || "No name yet"}
                    {doc.data.profile.headline ? ` — ${doc.data.profile.headline}` : ""}
                  </p>
                </button>
                <button
                  aria-label={`Delete ${doc.title || "Untitled"}`}
                  className="absolute right-4 top-4 rounded-pill px-2 py-1 text-caption text-muted opacity-0 transition-opacity hover:text-vermilion-600 focus-visible:opacity-100 group-hover:opacity-100"
                  onClick={() => void remove(doc.id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense>
      <Dashboard />
    </Suspense>
  );
}

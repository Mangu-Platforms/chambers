import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { DiffCard } from "@/components/ats/diff-card";
import { AppNav } from "@/components/layout/nav";
import { PageSkeleton } from "@/components/layout/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHydrated } from "@/hooks/use-hydrated";
import { useResumeStore } from "@/lib/resume/store";
import { templateMeta } from "@/lib/resume/templates";

export const Route = createFileRoute("/versions")({
  component: VersionsPage,
  head: () => ({ meta: [{ title: "Versions · Chambers" }] }),
});

function VersionsPage() {
  const ready = useHydrated();
  const versions = useResumeStore((s) => s.versions);
  const saveVersion = useResumeStore((s) => s.saveVersion);
  const loadVersion = useResumeStore((s) => s.loadVersion);
  const deleteVersion = useResumeStore((s) => s.deleteVersion);
  const renameVersion = useResumeStore((s) => s.renameVersion);
  const duplicateVersion = useResumeStore((s) => s.duplicateVersion);
  const current = useResumeStore((s) => s.resume);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [diffId, setDiffId] = useState<string | null>(null);

  if (!ready) return <PageSkeleton label="Loading versions" />;

  return (
    <div className="min-h-screen bg-paper">
      <AppNav />
      <main id="main" className="mx-auto max-w-page px-5 py-12 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="kicker">Versions</span>
            <h1 className="font-serif mt-3 text-3xl font-medium tracking-[-0.03em] md:text-5xl">
              One posting, one saved sheet.
            </h1>
            <p className="mt-4 max-w-xl text-body text-soft">
              Up to 20 named snapshots on this device. Resume, paper, posting, and letter travel together.
            </p>
          </div>
          <form
            className="flex flex-wrap gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const v = saveVersion(name);
              setName("");
              toast.success(`Saved “${v.name}”`);
            }}
          >
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name this version"
              aria-label="Version name"
              className="w-48"
            />
            <Button type="submit">Save current</Button>
          </form>
        </div>

        {versions.length === 0 ? (
          <p className="mt-16 text-body text-soft">
            Nothing saved yet. Tailor a posting, then save — or press ⌘S / Ctrl+S from Studio.
          </p>
        ) : (
          <ul className="mt-12 flex flex-col gap-3">
            {versions.map((v) => (
              <li key={v.id} className="hairline rounded-lg p-4 md:p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <Input
                    aria-label="Version name"
                    defaultValue={v.name}
                    className="md:max-w-sm"
                    onBlur={(e) => {
                      if (e.target.value.trim() && e.target.value !== v.name) {
                        renameVersion(v.id, e.target.value);
                      }
                    }}
                  />
                  <p className="flex-1 text-caption text-soft">
                    {templateMeta(v.templateId).name}
                    {v.targetRole ? ` · ${v.targetRole}` : ""}
                    {v.targetCompany ? ` at ${v.targetCompany}` : ""}
                    {" · "}
                    {new Date(v.savedAt).toLocaleString()}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        loadVersion(v.id);
                        toast.success(`Loaded “${v.name}”`);
                        void navigate({ to: "/studio" });
                      }}
                    >
                      Load
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const copy = duplicateVersion(v.id);
                        if (copy) toast.success(`Duplicated “${copy.name}”`);
                      }}
                    >
                      Duplicate
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDiffId(diffId === v.id ? null : v.id)}
                    >
                      {diffId === v.id ? "Hide diff" : "Diff vs current"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteVersion(v.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
                {diffId === v.id ? (
                  <DiffCard before={v.resume} after={current} title={`“${v.name}” vs current sheet`} />
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

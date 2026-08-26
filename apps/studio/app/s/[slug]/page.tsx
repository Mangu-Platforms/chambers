import Link from "next/link";
import { notFound } from "next/navigation";
import { ResumeSheet } from "@/components/sheet/ResumeSheet";
import { coerceResumeData, coerceTemplate } from "@/lib/resume/schema";
import { getServerSupabase } from "@/lib/supabase/server";
import { isValidSlug } from "@/lib/resume/slug";
import type { Metadata } from "next";

export const revalidate = 60; // public pages can be a minute stale — instant loads

/**
 * Public read-only share page. Served only when the owner turned sharing on;
 * RLS enforces `is_public = true` for the anon role, so a leaked slug of a
 * private document returns nothing.
 */

async function loadShared(slug: string) {
  if (!isValidSlug(slug)) return null;
  const supabase = await getServerSupabase();
  if (!supabase) return null;
  const { data } = await supabase
    .from("documents")
    .select("title, template, data")
    .eq("slug", slug)
    .eq("is_public", true)
    .maybeSingle();
  return data ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = await loadShared(slug);
  return { title: doc?.title ?? "Shared resume", robots: { index: false } };
}

export default async function SharePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = await loadShared(slug);
  if (!doc) notFound();

  return (
    <div className="min-h-screen">
      <header className="no-print mx-auto flex h-16 max-w-chambers items-center justify-between px-6">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-body font-semibold tracking-tightish">Chambers</span>
          <span className="text-caption font-medium uppercase tracking-[0.16em] text-vermilion-600">
            Studio
          </span>
        </Link>
        <Link
          href="/"
          className="text-meta font-medium text-vermilion-600 underline-offset-4 hover:underline"
        >
          Make yours
        </Link>
      </header>
      <main className="print-stage mx-auto max-w-chambers px-4 pb-16 pt-4 md:px-6">
        <ResumeSheet data={coerceResumeData(doc.data)} template={coerceTemplate(doc.template)} />
      </main>
    </div>
  );
}

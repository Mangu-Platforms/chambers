"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import type { ReactNode } from "react";

/** App chrome shared by dashboard, editor and export. Hidden when printing. */
export function StudioHeader({ children }: { children?: ReactNode }) {
  const supabase = getBrowserSupabase();
  const router = useRouter();

  return (
    <header className="no-print sticky top-0 z-10 border-b border-line bg-fog/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-4 px-4 md:px-6">
        <Link href="/app" className="flex shrink-0 items-baseline gap-2">
          <span className="text-body font-semibold tracking-tightish">Chambers</span>
          <span className="text-caption font-medium uppercase tracking-[0.16em] text-vermilion-600">
            Studio
          </span>
        </Link>
        <div className="flex min-w-0 flex-1 items-center justify-center">{children}</div>
        <div className="flex shrink-0 items-center gap-2">
          {supabase ? (
            <button
              className="h-9 rounded-pill px-4 text-meta font-medium text-muted transition-colors hover:text-vermilion-600"
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/");
                router.refresh();
              }}
            >
              Sign out
            </button>
          ) : (
            <span
              className="rounded-pill border border-line bg-white px-3 py-1 text-caption font-medium uppercase tracking-[0.12em] text-muted"
              title="No Supabase configured — documents live in this browser."
            >
              Demo
            </span>
          )}
        </div>
      </div>
    </header>
  );
}

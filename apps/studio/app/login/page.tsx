"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { getBrowserSupabase } from "@/lib/supabase/browser";

function LoginForm() {
  const supabase = getBrowserSupabase();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/app";

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!supabase) {
    return (
      <div className="rounded-chambers border border-line bg-white p-8 shadow-chambers">
        <h1 className="text-title font-semibold tracking-tightish">Demo mode</h1>
        <p className="mt-3 text-body leading-relaxed tracking-body text-muted">
          This deployment has no Supabase configured, so there are no accounts. Your documents are
          saved privately in this browser instead — everything else works: editing, live preview,
          and every export.
        </p>
        <div className="mt-6">
          <Link
            href="/app"
            className="inline-flex h-11 items-center rounded-pill bg-vermilion-600 px-6 text-body font-medium text-white transition-[filter] hover:brightness-95"
          >
            Continue to the studio
          </Link>
        </div>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setMessage(null);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(next);
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage("Check your inbox to confirm your address, then sign in.");
        setMode("signin");
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-chambers border border-line bg-white p-8 shadow-chambers">
      <h1 className="text-title font-semibold tracking-tightish">
        {mode === "signin" ? "Welcome back" : "Create your account"}
      </h1>
      <div className="mt-6 space-y-4">
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          label="Password"
          type="password"
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {message ? (
        <p className="mt-4 text-meta leading-relaxed text-vermilion-600" role="status">
          {message}
        </p>
      ) : null}
      <div className="mt-6 flex items-center justify-between gap-3">
        <Button type="submit" variant="primary" disabled={busy}>
          {busy ? "One moment…" : mode === "signin" ? "Sign in" : "Sign up"}
        </Button>
        <button
          type="button"
          className="text-meta text-muted underline-offset-4 hover:text-vermilion-600 hover:underline"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin" ? "New here? Create an account" : "Have an account? Sign in"}
        </button>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex h-16 max-w-chambers items-center px-6">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-lead font-semibold tracking-tightish">Chambers</span>
          <span className="text-caption font-medium uppercase tracking-[0.16em] text-vermilion-600">
            Studio
          </span>
        </Link>
      </header>
      <main className="mx-auto max-w-md px-6 pt-16">
        <Suspense>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}

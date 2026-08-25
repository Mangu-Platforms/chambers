"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { log } from "@/lib/log";

/** Route-level error boundary. Calm, recoverable, nothing leaks. */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    log.error("client error boundary", { digest: error.digest, name: error.name });
  }, [error]);

  return (
    <div className="mx-auto max-w-md px-6 pt-24 text-center">
      <p className="text-caption font-medium uppercase tracking-[0.18em] text-vermilion-600">
        Something broke
      </p>
      <h1 className="mt-2 text-title font-semibold tracking-tightish">Not your fault.</h1>
      <p className="mt-2 text-body leading-relaxed tracking-body text-muted">
        The page hit an error. Your document is safe — edits save as you type. Try again, and if it
        keeps happening, reload the tab.
      </p>
      <div className="mt-6 flex justify-center">
        <Button variant="primary" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}

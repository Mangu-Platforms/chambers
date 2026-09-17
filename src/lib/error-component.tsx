import type { ErrorComponentProps } from "@tanstack/react-router";

const FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return FALLBACK_MESSAGE;
}

export function AppErrorComponent({ error }: ErrorComponentProps) {
  return (
    <main className="grid min-h-screen place-items-center bg-paper px-6 text-center text-ink">
      <div>
        <p className="kicker">Chambers</p>
        <h1 className="mt-3 font-serif text-2xl font-medium tracking-[-0.03em]">
          Something went wrong
        </h1>
        <p className="mt-3 max-w-md text-sm break-words text-soft">{errorMessage(error)}</p>
      </div>
    </main>
  );
}

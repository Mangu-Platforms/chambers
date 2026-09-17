import { cn } from "@/lib/cn";

export function PageSkeleton({ label = "Loading" }: { label?: string }) {
  return (
    <div
      className="grid min-h-screen place-items-center bg-fog px-6"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">{label}</span>
      <div
        className={cn(
          "w-full max-w-[280px] animate-pulse rounded-lg border border-hair bg-paper",
        )}
        style={{ aspectRatio: "8.5 / 11" }}
      />
    </div>
  );
}

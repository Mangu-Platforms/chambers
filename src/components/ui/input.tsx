import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-md border border-hair bg-paper px-3.5 text-body text-ink tracking-[-0.011em] outline-none placeholder:text-faint focus:ring-2 focus:ring-vermilion/20",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-md border border-hair bg-paper px-3.5 py-3 text-body leading-[1.47] text-ink tracking-[-0.011em] outline-none placeholder:text-faint focus:ring-2 focus:ring-vermilion/20",
        className,
      )}
      {...props}
    />
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-micro font-semibold uppercase tracking-[0.12em] text-soft">
        {label}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-soft">{hint}</span> : null}
    </label>
  );
}

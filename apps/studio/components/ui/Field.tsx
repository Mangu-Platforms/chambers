"use client";

import type { ComponentProps } from "react";
import { useId } from "react";

/** 44px input + label. The only text field in the product. */
export function Field({
  label,
  className = "",
  ...props
}: ComponentProps<"input"> & { label: string }) {
  const id = useId();
  return (
    <label htmlFor={id} className={`block ${className}`}>
      <span className="mb-1 block text-caption font-medium uppercase tracking-[0.12em] text-muted">
        {label}
      </span>
      <input
        id={id}
        className="h-11 w-full rounded-chambers border border-line bg-white px-3.5 text-body tracking-body text-ink placeholder:text-muted/60"
        {...props}
      />
    </label>
  );
}

/** Multiline sibling of Field. */
export function TextArea({
  label,
  className = "",
  ...props
}: ComponentProps<"textarea"> & { label: string }) {
  const id = useId();
  return (
    <label htmlFor={id} className={`block ${className}`}>
      <span className="mb-1 block text-caption font-medium uppercase tracking-[0.12em] text-muted">
        {label}
      </span>
      <textarea
        id={id}
        className="min-h-[88px] w-full rounded-chambers border border-line bg-white px-3.5 py-2.5 text-body leading-[1.47] tracking-body text-ink placeholder:text-muted/60"
        {...props}
      />
    </label>
  );
}

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/**
 * The Chambers button: 44px pill. Three looks, nothing else.
 *  - primary: vermilion fill (the pulse — use once per view)
 *  - quiet: paper + hairline
 *  - ghost: text only
 */

type Variant = "primary" | "quiet" | "ghost";

const base =
  "inline-flex h-11 items-center justify-center gap-2 rounded-pill px-6 text-body font-medium tracking-body transition-colors duration-200 select-none disabled:opacity-40 disabled:pointer-events-none";

const looks: Record<Variant, string> = {
  primary: "bg-vermilion-500 text-white hover:bg-vermilion-600",
  quiet: "bg-white text-ink border border-line hover:border-[rgba(255,77,0,0.72)]",
  ghost: "text-vermilion-600 hover:bg-white",
};

export function Button({
  variant = "quiet",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return <button className={`${base} ${looks[variant]} ${className}`} {...props} />;
}

export function ButtonLink({
  variant = "quiet",
  className = "",
  href,
  children,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; children: ReactNode }) {
  return (
    <Link href={href} className={`${base} ${looks[variant]} ${className}`} {...props}>
      {children}
    </Link>
  );
}

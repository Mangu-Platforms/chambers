import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/cn";

export function BrandMark({
  to = "/",
  wordmark = true,
  size = "md",
}: {
  to?: string;
  wordmark?: boolean;
  size?: "sm" | "md";
}) {
  const tile = size === "sm" ? "size-[26px] rounded-[7px]" : "size-[30px] rounded-[8px]";
  return (
    <Link to={to} className="flex items-center gap-2.5 font-semibold tracking-[-0.02em] text-ink">
      <span
        className={cn("grid place-items-center bg-vermilion text-paper", tile)}
        aria-hidden
      >
        <svg viewBox="0 0 16 16" className={size === "sm" ? "size-3.5" : "size-4"} fill="none">
          <path
            d="M3 11.5V4.5h4.2c1.7 0 2.8.9 2.8 2.3 0 .9-.5 1.6-1.3 2L13 11.5H11L8.1 8.7H4.8V11.5H3Zm1.8-4.5h2.2c.9 0 1.4-.4 1.4-1.1S7.9 5.8 7 5.8H4.8V7Z"
            fill="currentColor"
          />
        </svg>
      </span>
      {wordmark ? (
        <span className={size === "sm" ? "text-[15px]" : "text-base"}>CHAMBERS</span>
      ) : null}
    </Link>
  );
}

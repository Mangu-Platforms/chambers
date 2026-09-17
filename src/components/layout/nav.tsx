import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { BrandMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const LINKS = [
  { to: "/studio", label: "Studio" },
  { to: "/tailor", label: "Tailor" },
  { to: "/letter", label: "Letter" },
  { to: "/templates", label: "Paper" },
  { to: "/versions", label: "Versions" },
  { to: "/export", label: "Export" },
] as const;

export function AppNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  return (
    <header className="no-print sticky top-0 z-50 border-b border-hair bg-paper">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-ink focus:px-3 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-14 max-w-page items-center gap-3 px-5 md:h-16 md:px-7">
        <BrandMark size="sm" />
        <nav className="ml-4 hidden items-center gap-5 text-sm font-medium text-soft lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              aria-current={pathname === l.to ? "page" : undefined}
              className={cn(
                "transition-[color] duration-150 ease-out hover:text-ink",
                pathname === l.to && "text-ink",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Button asChild size="sm" variant="ghost" className="hidden sm:inline-flex">
            <Link to="/start">Start from a file</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/studio">Open Studio</Link>
          </Button>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-pill text-ink lg:hidden"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {open ? (
        <nav className="border-t border-hair px-5 py-3 lg:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={cn(
                "flex h-11 items-center text-sm font-medium text-soft",
                pathname === l.to && "text-ink",
              )}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/tools"
            onClick={() => setOpen(false)}
            className="flex h-11 items-center text-sm font-medium text-soft"
          >
            Tools
          </Link>
        </nav>
      ) : null}
    </header>
  );
}

export function AppFooter() {
  return (
    <footer className="no-print border-t border-hair px-5 py-12 text-sm text-soft">
      <div className="mx-auto flex max-w-page flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <BrandMark size="sm" />
          <p className="mt-3 max-w-md text-caption leading-relaxed">
            Resume and cover letter studio. Letter-width paper, one vermilion mark. Your file stays on
            this device.
          </p>
        </div>
        <p className="text-caption">Private by default</p>
      </div>
    </footer>
  );
}

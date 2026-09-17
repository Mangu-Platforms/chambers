import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { AppFooter, AppNav } from "@/components/layout/nav";
import { PaperThumb } from "@/components/resume/paper-thumb";
import { ResumeSheet } from "@/components/resume/sheet";
import { Button } from "@/components/ui/button";
import { DEMO_RESUME } from "@/lib/resume/sample";
import { TEMPLATES } from "@/lib/resume/templates";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      {
        title: "Chambers",
      },
    ],
  }),
});

function Home() {
  return (
    <div className="min-h-screen bg-paper">
      <AppNav />
      <main id="main">
        <Hero />
        <Steps />
        <PaperBand />
        <Close />
      </main>
      <AppFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="px-5 pb-20 pt-12 md:px-8 md:pb-28 md:pt-16">
      <div className="mx-auto grid max-w-page items-start gap-16 lg:grid-cols-[0.92fr_1.08fr]">
        <div>
          <span className="kicker">Chambers · resume studio</span>
          <h1 className="font-serif mt-5 text-4xl font-medium leading-[1.08] tracking-[-0.03em] text-ink md:text-6xl">
            The resume that looks like you meant it.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-soft">
            Paste what you have. We put it on letter paper, tailor it to the posting, and never
            invent a fact.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link to="/start">
                Start from a resume <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <Link to="/studio">Open Studio</Link>
            </Button>
          </div>
          <p className="mt-5 text-caption text-soft">Free on this device. No account. No watermark.</p>
        </div>
        <div className="relative overflow-hidden rounded-lg border border-hair bg-fog shadow-chambers">
          <div className="max-h-[min(72vh,640px)] overflow-hidden">
            <ResumeSheet
              resume={DEMO_RESUME}
              template="letter"
              className="!mx-0 !max-w-none !rounded-none !border-0 !shadow-none"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Steps() {
  const steps = [
    {
      n: "01",
      title: "Import",
      body: "Paste a messy file. Identity, roles, bullets, and skills land on paper in seconds.",
    },
    {
      n: "02",
      title: "Tailor",
      body: "One posting. One honest version. Missing keywords stay listed — never fabricated.",
    },
    {
      n: "03",
      title: "Print",
      body: "Letter-width sheet, print stylesheet, PDF from the browser. Same voice for the cover letter.",
    },
  ];
  return (
    <section className="cv-section border-t border-hair px-5 py-20 md:px-8">
      <div className="mx-auto grid max-w-page gap-12 md:grid-cols-3 md:gap-10">
        {steps.map((s) => (
          <div key={s.n}>
            <p className="font-mono text-micro tabular-nums text-faint">{s.n}</p>
            <h2 className="mt-3 font-serif text-2xl font-medium tracking-[-0.03em]">{s.title}</h2>
            <p className="mt-3 text-body leading-relaxed text-soft">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PaperBand() {
  return (
    <section className="cv-section border-t border-hair px-5 py-20 md:px-8">
      <div className="mx-auto max-w-page">
        <div className="max-w-xl">
          <span className="kicker">Paper</span>
          <h2 className="font-serif mt-3 text-3xl font-medium tracking-[-0.03em] md:text-4xl">
            Six sheets. One hairline for the one you choose.
          </h2>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((t) => (
            <Link
              key={t.id}
              to="/templates"
              className="rounded-lg border border-hair bg-paper p-3 transition-[border-color,box-shadow] duration-150 ease-out hover:border-hair-strong hover:shadow-pop"
            >
              <div className="overflow-hidden rounded-md border border-hair">
                <PaperThumb template={t.id} />
              </div>
              <div className="px-1 pb-1 pt-4">
                <h3 className="font-display text-lg font-semibold tracking-[-0.03em]">{t.name}</h3>
                <p className="mt-1 text-caption leading-relaxed text-soft">{t.blurb}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function Close() {
  return (
    <section className="cv-section border-t border-hair px-5 py-20 md:px-8">
      <div className="mx-auto max-w-page">
        <h2 className="font-serif max-w-xl text-3xl font-medium tracking-[-0.03em] md:text-4xl">
          Private by default. Stored in this browser, not on a server.
        </h2>
        <p className="mt-4 max-w-lg text-body leading-relaxed text-soft">
          Instant ATS match against the posting you paste. Local tailor in a blink, then print when
          the paper is honest.
        </p>
        <ul className="mt-6 flex flex-col gap-2 text-body text-soft">
          <li>No account. No watermark. No invented jobs.</li>
          <li>Letter-width paper, six sheets, one vermilion mark.</li>
          <li>Cover letter in the same voice as the resume.</li>
        </ul>
        <div className="mt-8">
          <Button asChild size="lg">
            <Link to="/start">
              Start from a resume <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

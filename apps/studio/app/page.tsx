import { ButtonLink } from "@/components/ui/Button";

/**
 * Marketing. Fully static server component — zero client JS beyond the framework.
 * Chambers language: fog ground, paper cards, one vermilion hairline.
 */
export default function Marketing() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex h-16 max-w-chambers items-center justify-between px-6">
        <div className="flex items-baseline gap-2">
          <span className="text-lead font-semibold tracking-tightish">Chambers</span>
          <span className="text-caption font-medium uppercase tracking-[0.16em] text-vermilion-600">
            Studio
          </span>
        </div>
        <nav className="flex items-center gap-2">
          <ButtonLink href="/login" variant="ghost">
            Sign in
          </ButtonLink>
          <ButtonLink href="/app" variant="primary">
            Open the studio
          </ButtonLink>
        </nav>
      </header>

      <main>
        <section className="mx-auto max-w-chambers px-6 pb-20 pt-20 text-center md:pt-28">
          <p className="mb-4 text-caption font-medium uppercase tracking-[0.18em] text-vermilion-600">
            The calm resume studio
          </p>
          <h1 className="mx-auto max-w-3xl font-display text-display font-semibold tracking-display md:text-hero">
            One page. Perfectly set.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lead leading-relaxed tracking-body text-muted">
            Edit on the left, watch real letter paper update on the right, and export a PDF that
            matches the screen — plus ATS-clean text and DOCX. Nothing else in the way.
          </p>
          <div className="mt-9 flex items-center justify-center gap-3">
            <ButtonLink href="/app" variant="primary">
              Start a resume
            </ButtonLink>
            <ButtonLink href="/app?sample=1" variant="quiet">
              See the sample
            </ButtonLink>
          </div>
          <p className="mt-4 text-meta text-muted">
            No account needed to try it — your draft stays in this browser.
          </p>
        </section>

        <section className="border-t border-line bg-white">
          <div className="mx-auto grid max-w-chambers gap-10 px-6 py-16 md:grid-cols-3">
            <div>
              <h2 className="text-title font-semibold tracking-tightish">Live paper</h2>
              <p className="mt-2 text-body leading-relaxed tracking-body text-muted">
                The preview is the same sheet the PDF prints. What you see is exactly what a hiring
                manager holds.
              </p>
            </div>
            <div>
              <h2 className="text-title font-semibold tracking-tightish">ATS first</h2>
              <p className="mt-2 text-body leading-relaxed tracking-body text-muted">
                Plain-text and DOCX exports are first-class: single column, real headings, standard
                bullets. Parsers read every line.
              </p>
            </div>
            <div>
              <h2 className="text-title font-semibold tracking-tightish">Three templates</h2>
              <p className="mt-2 text-body leading-relaxed tracking-body text-muted">
                Classic letter, Compact, Executive — one visual language, zero clutter. Switch any
                time; your content never reflows into chaos.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-chambers px-6 py-16 text-center">
          <p className="text-body tracking-body text-muted">
            Built on the Chambers design language — system fonts, a locked type scale, and one thin
            vermilion hairline.
          </p>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-chambers flex-wrap items-center justify-between gap-3 px-6 py-8 text-meta text-muted">
          <span>Chambers Studio · Mangu Platforms</span>
          <span>Calm is the feature.</span>
        </div>
      </footer>
    </div>
  );
}

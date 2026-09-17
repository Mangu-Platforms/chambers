import { Link } from "@tanstack/react-router";
import { BrandMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-paper px-6 text-center text-ink">
      <div>
        <BrandMark size="sm" />
        <p className="kicker mt-8">404</p>
        <h1 className="font-serif mt-3 text-3xl font-medium tracking-[-0.03em]">
          That page isn’t on this paper.
        </h1>
        <p className="mt-3 text-body text-soft">The studio, tailor, and letter are still here.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link to="/studio">Open Studio</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/">Home</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

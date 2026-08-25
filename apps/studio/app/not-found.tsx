import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-6 pt-24 text-center">
      <p className="text-caption font-medium uppercase tracking-[0.18em] text-vermilion-600">404</p>
      <h1 className="mt-2 text-title font-semibold tracking-tightish">Nothing at this address.</h1>
      <p className="mt-2 text-body leading-relaxed tracking-body text-muted">
        The page you are after does not exist, or its share link was turned off.
      </p>
      <div className="mt-6 flex justify-center">
        <ButtonLink href="/" variant="primary">
          Back home
        </ButtonLink>
      </div>
    </div>
  );
}

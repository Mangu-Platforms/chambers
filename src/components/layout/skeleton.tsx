export function PageSkeleton({ label = "Loading" }: { label?: string }) {
  return (
    <div className="grid min-h-screen place-items-center bg-fog text-soft">
      <p className="text-sm tracking-[-0.02em]">{label}…</p>
    </div>
  );
}

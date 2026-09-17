import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/lib/resume/store";

export function PrintButton({
  label = "Print / PDF",
  title,
}: {
  label?: string;
  title?: string;
}) {
  const name = useResumeStore((s) => s.resume.identity.name);
  const print = () => {
    const prev = document.title;
    document.title = title || (name ? `${name} — Chambers` : "Chambers");
    window.print();
    window.setTimeout(() => {
      document.title = prev;
    }, 1000);
  };
  return (
    <Button type="button" variant="ghost" size="sm" onClick={print}>
      <Printer className="size-4" />
      {label}
    </Button>
  );
}

import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useResumeStore } from "@/lib/resume/store";

export function StudioHotkeys() {
  const navigate = useNavigate();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (!meta) return;
      const t = e.target as HTMLElement | null;
      const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (e.key.toLowerCase() === "s") {
        e.preventDefault();
        const v = useResumeStore.getState().saveVersion();
        toast.success(`Saved “${v.name}”`);
        return;
      }
      if (e.key.toLowerCase() === "e" && e.shiftKey) {
        e.preventDefault();
        void navigate({ to: "/export" });
        return;
      }
      if (e.key.toLowerCase() === "z" && !typing) {
        const snap = useResumeStore.getState().snapshot;
        if (snap) {
          e.preventDefault();
          useResumeStore.getState().undoTailor();
          toast.message("Restored the pre-tailor sheet");
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);
  return null;
}

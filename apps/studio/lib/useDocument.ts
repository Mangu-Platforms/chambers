"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getDocumentStore } from "@/lib/store";
import type { ResumeData, StudioDocument, TemplateId } from "@/lib/resume/schema";

export type SaveState = "loading" | "saved" | "saving" | "error" | "missing";

const SAVE_DELAY_MS = 600;

/**
 * Optimistic document editing: state updates instantly, persistence is debounced
 * in the background. Works identically against demo and Supabase stores.
 */
export function useDocument(id: string) {
  const [doc, setDoc] = useState<StudioDocument | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("loading");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<Partial<Pick<StudioDocument, "title" | "template" | "data">>>({});

  useEffect(() => {
    let cancelled = false;
    getDocumentStore()
      .get(id)
      .then((loaded) => {
        if (cancelled) return;
        if (!loaded) {
          setSaveState("missing");
        } else {
          setDoc(loaded);
          setSaveState("saved");
        }
      })
      .catch(() => {
        if (!cancelled) setSaveState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const flush = useCallback(async () => {
    const patch = pending.current;
    pending.current = {};
    if (Object.keys(patch).length === 0) return;
    setSaveState("saving");
    try {
      const updated = await getDocumentStore().update(id, patch);
      setDoc((current) =>
        current ? { ...current, updatedAt: updated.updatedAt, slug: updated.slug } : current,
      );
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }, [id]);

  const queue = useCallback(
    (patch: Partial<Pick<StudioDocument, "title" | "template" | "data">>) => {
      pending.current = { ...pending.current, ...patch };
      setDoc((current) => (current ? { ...current, ...patch } : current));
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void flush(), SAVE_DELAY_MS);
    },
    [flush],
  );

  // Flush on unload so a quick tab close doesn't lose the last keystrokes.
  useEffect(() => {
    const handler = () => void flush();
    window.addEventListener("beforeunload", handler);
    return () => {
      window.removeEventListener("beforeunload", handler);
      void flush();
    };
  }, [flush]);

  const setTitle = useCallback((title: string) => queue({ title }), [queue]);
  const setTemplate = useCallback((template: TemplateId) => queue({ template }), [queue]);
  const setData = useCallback(
    (mutate: (data: ResumeData) => ResumeData) => {
      setDoc((current) => {
        if (!current) return current;
        const nextData = mutate(current.data);
        pending.current = { ...pending.current, data: nextData };
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => void flush(), SAVE_DELAY_MS);
        return { ...current, data: nextData };
      });
    },
    [flush],
  );

  return { doc, saveState, setTitle, setTemplate, setData, flush };
}

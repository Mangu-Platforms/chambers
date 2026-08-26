"use client";

import { getBrowserSupabase } from "@/lib/supabase/browser";
import { LocalDocumentStore } from "./local";
import { SupabaseDocumentStore } from "./supabase";
import type { DocumentStore } from "./types";

let store: DocumentStore | null = null;

/** The active store for this browser: Supabase when configured, demo otherwise. */
export function getDocumentStore(): DocumentStore {
  if (store) return store;
  const supabase = getBrowserSupabase();
  store = supabase ? new SupabaseDocumentStore(supabase) : new LocalDocumentStore();
  return store;
}

export type { DocumentStore } from "./types";

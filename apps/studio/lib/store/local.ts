"use client";

import {
  coerceResumeData,
  coerceTemplate,
  documentSchema,
  emptyResume,
  type StudioDocument,
} from "@/lib/resume/schema";
import type { DocumentPatch, DocumentStore } from "./types";

const KEY = "chambers.studio.documents.v1";

function readAll(): StudioDocument[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => documentSchema.safeParse(item))
      .filter((r) => r.success)
      .map((r) => (r as { success: true; data: StudioDocument }).data);
  } catch {
    return [];
  }
}

function writeAll(docs: StudioDocument[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(docs));
  } catch {
    // Quota or private-mode failure: the editor keeps working in memory.
  }
}

function newId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `doc-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Demo-mode persistence: documents live in this browser's localStorage. */
export class LocalDocumentStore implements DocumentStore {
  readonly mode = "demo" as const;

  async list(): Promise<StudioDocument[]> {
    return readAll().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async get(id: string): Promise<StudioDocument | null> {
    return readAll().find((d) => d.id === id) ?? null;
  }

  async create(input?: Partial<DocumentPatch>): Promise<StudioDocument> {
    const now = new Date().toISOString();
    const doc: StudioDocument = {
      id: newId(),
      title: input?.title ?? "Untitled",
      template: coerceTemplate(input?.template ?? "classic"),
      data: input?.data ? coerceResumeData(input.data) : emptyResume(),
      isPublic: false,
      slug: null,
      createdAt: now,
      updatedAt: now,
    };
    const docs = readAll();
    docs.push(doc);
    writeAll(docs);
    return doc;
  }

  async update(id: string, patch: DocumentPatch): Promise<StudioDocument> {
    const docs = readAll();
    const idx = docs.findIndex((d) => d.id === id);
    if (idx === -1) throw new Error("Document not found");
    const current = docs[idx];
    const next: StudioDocument = {
      ...current,
      title: patch.title !== undefined ? patch.title : current.title,
      template: patch.template !== undefined ? coerceTemplate(patch.template) : current.template,
      data: patch.data !== undefined ? coerceResumeData(patch.data) : current.data,
      isPublic: patch.isPublic !== undefined ? patch.isPublic : current.isPublic,
      slug: patch.slug !== undefined ? patch.slug : current.slug,
      updatedAt: new Date().toISOString(),
    };
    docs[idx] = next;
    writeAll(docs);
    return next;
  }

  async remove(id: string): Promise<void> {
    writeAll(readAll().filter((d) => d.id !== id));
  }

  async recordExport(): Promise<void> {
    // Demo mode has no audit trail — nothing leaves the browser.
  }
}

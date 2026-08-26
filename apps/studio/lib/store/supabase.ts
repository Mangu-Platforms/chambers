"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  coerceResumeData,
  coerceTemplate,
  emptyResume,
  type StudioDocument,
} from "@/lib/resume/schema";
import { log } from "@/lib/log";
import type { DocumentPatch, DocumentStore, ExportFormat } from "./types";

interface DocumentRow {
  id: string;
  user_id: string;
  title: string | null;
  template: string | null;
  data: unknown;
  is_public: boolean | null;
  slug: string | null;
  created_at: string;
  updated_at: string;
}

function rowToDoc(row: DocumentRow): StudioDocument {
  return {
    id: row.id,
    title: row.title ?? "Untitled",
    template: coerceTemplate(row.template),
    data: coerceResumeData(row.data),
    isPublic: Boolean(row.is_public),
    slug: row.slug,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Supabase persistence. RLS scopes every query to the signed-in user. */
export class SupabaseDocumentStore implements DocumentStore {
  readonly mode = "supabase" as const;

  constructor(private client: SupabaseClient) {}

  private async userId(): Promise<string> {
    const {
      data: { user },
    } = await this.client.auth.getUser();
    if (!user) throw new Error("Not signed in");
    return user.id;
  }

  async list(): Promise<StudioDocument[]> {
    const { data, error } = await this.client
      .from("documents")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) {
      log.error("documents.list failed", { code: error.code });
      throw new Error(error.message);
    }
    return (data as DocumentRow[]).map(rowToDoc);
  }

  async get(id: string): Promise<StudioDocument | null> {
    const { data, error } = await this.client
      .from("documents")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) {
      log.error("documents.get failed", { code: error.code });
      throw new Error(error.message);
    }
    return data ? rowToDoc(data as DocumentRow) : null;
  }

  async create(input?: Partial<DocumentPatch>): Promise<StudioDocument> {
    const userId = await this.userId();
    const { data, error } = await this.client
      .from("documents")
      .insert({
        user_id: userId,
        title: input?.title ?? "Untitled",
        template: coerceTemplate(input?.template ?? "classic"),
        data: input?.data ? coerceResumeData(input.data) : emptyResume(),
      })
      .select("*")
      .single();
    if (error) {
      log.error("documents.create failed", { code: error.code });
      throw new Error(error.message);
    }
    await this.audit("document.create", (data as DocumentRow).id);
    return rowToDoc(data as DocumentRow);
  }

  async update(id: string, patch: DocumentPatch): Promise<StudioDocument> {
    const row: Record<string, unknown> = {};
    if (patch.title !== undefined) row.title = patch.title;
    if (patch.template !== undefined) row.template = coerceTemplate(patch.template);
    if (patch.data !== undefined) row.data = coerceResumeData(patch.data);
    if (patch.isPublic !== undefined) row.is_public = patch.isPublic;
    if (patch.slug !== undefined) row.slug = patch.slug;
    const { data, error } = await this.client
      .from("documents")
      .update(row)
      .eq("id", id)
      .select("*")
      .single();
    if (error) {
      log.error("documents.update failed", { code: error.code });
      throw new Error(error.message);
    }
    return rowToDoc(data as DocumentRow);
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.client.from("documents").delete().eq("id", id);
    if (error) {
      log.error("documents.delete failed", { code: error.code });
      throw new Error(error.message);
    }
    await this.audit("document.delete", id);
  }

  async recordExport(id: string, format: ExportFormat): Promise<void> {
    await this.audit("document.export", id, { format });
  }

  private async audit(action: string, documentId: string, detail: Record<string, unknown> = {}) {
    try {
      const userId = await this.userId();
      await this.client
        .from("audit_events")
        .insert({ user_id: userId, document_id: documentId, action, detail });
    } catch {
      // The audit trail must never break the product path.
    }
  }
}

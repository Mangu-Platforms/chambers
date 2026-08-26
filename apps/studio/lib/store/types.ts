import type { ResumeData, StudioDocument, TemplateId } from "@/lib/resume/schema";

export type StoreMode = "demo" | "supabase";

export interface DocumentPatch {
  title?: string;
  template?: TemplateId;
  data?: ResumeData;
  isPublic?: boolean;
  slug?: string | null;
}

export type ExportFormat = "pdf" | "txt" | "docx";

/**
 * The one persistence contract. Two implementations:
 *  - LocalDocumentStore (demo mode, localStorage)
 *  - SupabaseDocumentStore (auth + Postgres + RLS)
 * All UI talks to this interface only.
 */
export interface DocumentStore {
  readonly mode: StoreMode;
  list(): Promise<StudioDocument[]>;
  get(id: string): Promise<StudioDocument | null>;
  create(input?: Partial<DocumentPatch>): Promise<StudioDocument>;
  update(id: string, patch: DocumentPatch): Promise<StudioDocument>;
  remove(id: string): Promise<void>;
  /** Audit hook — records an export event. Never contains resume content. */
  recordExport(id: string, format: ExportFormat): Promise<void>;
}

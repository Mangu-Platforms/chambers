import { importAnyJson } from "./json-io";
import type { ChambersPack } from "./json-io";
import { parseResumeText } from "./parse";
import type { Resume } from "./types";

export type IngestResult =
  | { source: "json-pack"; resume: Resume; pack: ChambersPack }
  | { source: "json-resume"; resume: Resume }
  | { source: "text"; resume: Resume };

export function looksLikeJson(text: string): boolean {
  const t = text.trim();
  return t.startsWith("{") && t.endsWith("}");
}

export function ingestResumeInput(text: string): IngestResult {
  const trimmed = text.trim();
  if (looksLikeJson(trimmed)) {
    const json = importAnyJson(trimmed);
    if (json?.kind === "pack") {
      return { source: "json-pack", resume: json.pack.resume, pack: json.pack };
    }
    if (json?.kind === "resume") {
      return { source: "json-resume", resume: json.resume };
    }
  }
  return { source: "text", resume: parseResumeText(trimmed) };
}

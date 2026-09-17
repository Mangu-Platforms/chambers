import { actionVerb, hasMetric } from "./text";

export type BulletHint = {
  verb: boolean;
  metric: boolean;
  tooLong: boolean;
  tooShort: boolean;
};

export function bulletHint(text: string): BulletHint | null {
  const t = text.trim();
  if (!t) return null;
  const words = t.split(/\s+/).length;
  return {
    verb: actionVerb(t),
    metric: hasMetric(t),
    tooLong: words > 40,
    tooShort: words < 8,
  };
}

export function hintLine(h: BulletHint): string | null {
  const bits: string[] = [];
  if (!h.verb) bits.push("lead with a verb");
  if (!h.metric) bits.push("add a figure if you have one");
  if (h.tooLong) bits.push("trim past 40 words");
  if (h.tooShort) bits.push("thin — add the outcome");
  return bits.length ? bits.join(" · ") : null;
}

export function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export function looksLikeEmail(s: string): boolean {
  const t = s.trim();
  return t.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
}

export function stripProtocol(s: string): string {
  return s.trim().replace(/^https?:\/\//i, "").replace(/\/$/, "");
}


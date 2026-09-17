export function highlightTerms(hay: string, terms: string[]): { text: string; hit: boolean }[] {
  if (!hay) return [];
  const clean = [...new Set(terms.map((t) => t.trim()).filter((t) => t.length >= 3))].sort(
    (a, b) => b.length - a.length,
  );
  if (!clean.length) return [{ text: hay, hit: false }];
  const escaped = clean.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts: { text: string; hit: boolean }[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(hay))) {
    if (m.index > last) parts.push({ text: hay.slice(last, m.index), hit: false });
    parts.push({ text: m[0], hit: true });
    last = m.index + m[0].length;
  }
  if (last < hay.length) parts.push({ text: hay.slice(last), hit: false });
  return parts.length ? parts : [{ text: hay, hit: false }];
}

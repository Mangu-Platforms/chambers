const ROLE_WORD = /senior|staff|engineer|designer|manager|hiring|director|lead|product|frontend|backend|tools/i;
const PLACE = /^(remote|hybrid|onsite|on-site|worldwide)/i;
const CITYISH = /,?\s*(AL|AK|AZ|AR|CA|CO|CT|DC|DE|FL|GA|HI|IA|ID|IL|IN|KS|KY|LA|MA|MD|ME|MI|MN|MO|MS|MT|NC|ND|NE|NH|NJ|NM|NV|NY|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VA|VT|WA|WI|WV)$/i;

function looksPlace(s: string): boolean {
  return PLACE.test(s) || CITYISH.test(s) || /remote/i.test(s);
}

export function inferCompany(jd: string): string {
  const lines = jd.split("\n").map((l) => l.trim()).filter(Boolean);
  const dashed = lines.find((l) => l.length > 0 && l.length < 90 && /—| - /.test(l));
  if (dashed) {
    const parts = dashed.split(/—| - /).map((s) => s.trim()).filter(Boolean);
    const a = parts[0] ?? "";
    const b = parts[1] ?? "";
    if (b && looksPlace(b) && a && !ROLE_WORD.test(a)) return stripTail(a);
    if (a && looksPlace(a) && b && !ROLE_WORD.test(b)) return stripTail(b);
    if (b && !ROLE_WORD.test(b) && !looksPlace(b)) return stripTail(b);
    if (a && !ROLE_WORD.test(a) && !looksPlace(a)) return stripTail(a);
    if (a && !looksPlace(a)) return stripTail(a);
  }
  const labeled = jd.match(/\b(?:company|employer)\s*[:—-]\s*([A-Z][^\n]{1,60})/i);
  if (labeled?.[1]) return stripTail(labeled[1]);
  const at = jd.match(/\bat\s+([A-Z][A-Za-z0-9&.’']+(?:\s+[A-Z][A-Za-z0-9&.’']+){0,4})/);
  const cand = at?.[1]?.trim() ?? "";
  if (cand && !looksPlace(cand)) return cand;
  return "";
}

export function inferRole(jd: string): string {
  const first = jd
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.length > 4 && l.length < 90 && !looksPlace(l));
  if (!first) return "";
  return first.split(/—| - /)[0]?.trim() ?? "";
}

export function inferTargets(jd: string): { company: string; role: string } {
  return { company: inferCompany(jd), role: inferRole(jd) };
}

function stripTail(s: string): string {
  return s.replace(/\s+[—–-]\s+.*$/, "").trim();
}

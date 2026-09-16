export function inferCompany(jd: string): string {
  const lines = jd.split("\n").map((l) => l.trim()).filter(Boolean);
  const dashed = lines.find((l) => l.length > 0 && l.length < 90 && /—| - /.test(l));
  if (dashed) {
    const parts = dashed.split(/—| - /).map((s) => s.trim());
    const company = parts[1] || parts[0];
    if (company && !/senior|staff|engineer|designer|manager|hiring/i.test(company)) {
      return company.replace(/\s+[—–-]\s+.*$/, "").trim();
    }
    if (parts[1]) return parts[1].replace(/\s+[—–-]\s+.*$/, "").trim();
  }
  const at = jd.match(/\bat\s+([A-Z][A-Za-z0-9&.’']+(?:\s+[A-Z][A-Za-z0-9&.’']+){0,4})/);
  return at?.[1]?.trim() ?? "";
}

export function inferRole(jd: string): string {
  const first = jd.split("\n").map((l) => l.trim()).find((l) => l.length > 4 && l.length < 90);
  if (!first) return "";
  return first.split(/—| - /)[0]?.trim() ?? "";
}

export function inferTargets(jd: string): { company: string; role: string } {
  return { company: inferCompany(jd), role: inferRole(jd) };
}

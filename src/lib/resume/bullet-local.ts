export function localVariants(bullet: string): string[] {
  const t = bullet.trim().replace(/\.$/, "");
  const v1 = t.replace(/^(responsible for|worked on|helped with|helped|assisted with)\s+/i, "Led ");
  const tight = t.replace(/\s+in order to\s+/gi, " to ").replace(/\s+that were\s+/gi, " ");
  const period = (s: string) => (s.endsWith(".") ? s : `${s}.`);
  return [...new Set([period(v1), period(tight), period(t)])].slice(0, 3);
}

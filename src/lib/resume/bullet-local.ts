const WEAK = /^(responsible for|worked on|helped with|helped|assisted with|assisted in|tasked with)\s+/i;

export function localVariants(bullet: string): string[] {
  const raw = bullet.trim();
  if (raw.length < 8) return [];
  const base = raw.replace(/\.$/, "");
  const led = base.replace(WEAK, "Led ");
  const delivered = base.replace(WEAK, "Delivered ");
  const tight = base
    .replace(/\s+in order to\s+/gi, " to ")
    .replace(/\s+that were\s+/gi, " ")
    .replace(/\s+that was\s+/gi, " ")
    .replace(/\s{2,}/g, " ");
  const out = [period(led), period(tight), period(delivered), period(base)];
  return [...new Set(out)].filter((v) => v.length > 8).slice(0, 3);
}

function period(s: string): string {
  const t = s.trim();
  if (!t) return t;
  return /[.!?]$/.test(t) ? t : `${t}.`;
}

const STOP = new Set(
  `a an the and or of to for in on at by with from as is are was were be been being
   this that these those it its you your we our they their i me my this role job
   will can able plus a plus about into over under than then also such using use
   used via per within without across including include includes including
   requirements requirement nice have looking candidate candidates team teams
   company we're we are you will who what when where which how your you're
   experience years year plus must should please apply joining join our the
   work working works well strong ability skills skill etc other more most
   document documents system systems tool tools pipeline pipelines remote
   hybrid onsite full-time fulltime full time role roles posting job jobs`.split(/\s+/),
);

export function normalize(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+.#/\s-]/g, " ")
    .split(/[\s,/|;]+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 1 && !STOP.has(w));
}

export function uniqueKeywords(text: string): string[] {
  if (!text.trim()) return [];
  const counts = new Map<string, number>();
  for (const w of tokenize(text)) {
    counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  const phrases = extractPhrases(text);
  const scored = [...counts.entries()]
    .filter(([w, n]) => n >= 1 && w.length > 2 && !/^\d/.test(w))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const out: string[] = [];
  const seen = new Set<string>();
  for (const p of phrases) {
    const key = p.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(p);
    }
  }
  for (const [w] of scored) {
    if (seen.has(w)) continue;
    if ([...seen].some((p) => p.includes(w) && p !== w)) continue;
    seen.add(w);
    out.push(w);
    if (out.length >= 36) break;
  }
  return out.slice(0, 36);
}

const PHRASE_HINTS = [
  "design system",
  "design tokens",
  "design-token",
  "next.js",
  "typescript",
  "print css",
  "cover letter",
  "product design",
  "product operations",
  "vendor management",
  "copy editing",
  "hiring loops",
  "letter-width",
  "ats-safe",
  "staff frontend",
  "visual snapshot",
  "token pipeline",
  "document renderer",
  "production ops",
  "epub 3",
  "independent press",
  "figma",
  "react",
  "playwright",
  "accessibility",
];

function extractPhrases(text: string): string[] {
  const lower = text.toLowerCase();
  const hinted = PHRASE_HINTS.filter((p) => lower.includes(p.replace("-", " ")) || lower.includes(p));
  const titled = [
    ...text.matchAll(
      /\b([A-Z][A-Za-z0-9.+#]*(?:\s+[A-Z][A-Za-z0-9.+#]*){1,3})\b/g,
    ),
  ]
    .map((m) => m[1].trim())
    .filter((p) => p.length > 3 && p.length < 40 && !/^(The|And|For|With|This|That)\b/.test(p));

  const tokens = tokenize(text);
  const bigrams = new Map<string, number>();
  for (let i = 0; i < tokens.length - 1; i++) {
    const a = tokens[i];
    const b = tokens[i + 1];
    if (a.length < 3 || b.length < 3) continue;
    const bg = `${a} ${b}`;
    bigrams.set(bg, (bigrams.get(bg) ?? 0) + 1);
  }
  const repeated = [...bigrams.entries()]
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([p]) => p);

  return [...hinted, ...titled.slice(0, 12), ...repeated.slice(0, 8)];
}

export function resumePlainText(parts: {
  identity?: { name?: string; title?: string };
  summary?: string;
  experience?: { role: string; org: string; bullets: string[] }[];
  education?: { school: string; degree: string }[];
  skills?: string[];
  extras?: { label: string; items: string[] }[];
}): string {
  const lines: string[] = [];
  if (parts.identity?.name) lines.push(parts.identity.name);
  if (parts.identity?.title) lines.push(parts.identity.title);
  if (parts.summary) lines.push(parts.summary);
  for (const job of parts.experience ?? []) {
    lines.push(job.role, job.org, ...job.bullets);
  }
  for (const ed of parts.education ?? []) lines.push(ed.degree, ed.school);
  if (parts.skills?.length) lines.push(parts.skills.join(" "));
  for (const x of parts.extras ?? []) lines.push(x.label, ...x.items);
  return lines.join("\n");
}

export function actionVerb(bullet: string): boolean {
  return /^(led|built|shipped|ran|cut|defined|designed|owned|wrote|reduced|mentored|partnered|managed|created|launched|improved|increased|delivered|coordinated|introduced|rebuilt|replaced|hired|edited|produced|directed|scaled|automated|implemented|established|architected|migrated|drove|grew|secured|negotiated|authored|reviewed|facilitated)\b/i.test(
    bullet.trim(),
  );
}

export function hasMetric(bullet: string): boolean {
  return /\d/.test(bullet);
}

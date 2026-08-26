const WORDS_A = ["amber", "calm", "clear", "ember", "fog", "iris", "linen", "north", "paper", "quiet"];
const WORDS_B = ["arch", "bridge", "chamber", "gate", "hall", "line", "sheet", "story", "studio", "vault"];

/** Short, readable, unguessable-enough share slug: word-word-xxxx. */
export function generateSlug(): string {
  const pick = (list: string[]) => list[Math.floor(Math.random() * list.length)];
  const tail = Math.random().toString(36).slice(2, 6);
  return `${pick(WORDS_A)}-${pick(WORDS_B)}-${tail}`;
}

/** Slugs are stored lowercase, [a-z0-9-], max 80 (matches DB constraint width). */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/.test(slug);
}

/**
 * Input sanitization for resume content.
 * React already escapes text on render; the jobs here are:
 *  1. strip control / zero-width characters that break ATS parsers and PDF text layers,
 *  2. clamp whitespace,
 *  3. allow only safe URL schemes on user-entered links (no `javascript:` etc.),
 * so the same cleaned value is safe for storage, screen, print, TXT and DOCX.
 */

// Control chars (keep \n and \t for multiline fields) and zero-width/joiner chars.
const CONTROL_CHARS = new RegExp("[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F]", "g");
const ZERO_WIDTH = new RegExp("[\\u200B-\\u200D\\u2060\\uFEFF]", "g");

export function cleanText(value: string): string {
  return value.replace(CONTROL_CHARS, "").replace(ZERO_WIDTH, "").replace(/\r\n?/g, "\n");
}

export function cleanLine(value: string): string {
  return cleanText(value).replace(/\s+/g, " ").trim();
}

const SAFE_SCHEMES = ["http:", "https:", "mailto:"];

/** Returns a safe absolute URL, or "" when the input cannot be made safe. */
export function cleanUrl(value: string): string {
  const raw = cleanLine(value);
  if (!raw) return "";
  const candidate = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(candidate);
    if (!SAFE_SCHEMES.includes(url.protocol)) return "";
    return url.href;
  } catch {
    return "";
  }
}

/** Display form of a URL: no scheme, no trailing slash. */
export function displayUrl(value: string): string {
  return value.replace(/^https?:\/\//, "").replace(/^mailto:/, "").replace(/\/$/, "");
}

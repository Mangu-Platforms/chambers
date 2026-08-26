/**
 * Structured JSON-line logger for server actions and critical paths.
 * Zero dependencies (Pino-compatible field shape: level, time, msg, ...context).
 * PII policy: emails, tokens and resume content never enter logs — `redact` strips
 * anything that looks like an email or bearer token from context values.
 */

type Level = "debug" | "info" | "warn" | "error";

const EMAIL = /[\w.+-]+@[\w-]+\.[\w.]+/g;
const BEARER = /(bearer\s+)[\w\-.~+/]+=*/gi;

function redactValue(value: unknown): unknown {
  if (typeof value === "string") {
    return value.replace(EMAIL, "[email]").replace(BEARER, "$1[token]");
  }
  if (Array.isArray(value)) return value.map(redactValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, redactValue(v)]),
    );
  }
  return value;
}

function emit(level: Level, msg: string, context?: Record<string, unknown>) {
  const line = JSON.stringify({
    level,
    time: new Date().toISOString(),
    msg,
    ...(context ? (redactValue(context) as Record<string, unknown>) : {}),
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const log = {
  debug: (msg: string, context?: Record<string, unknown>) => emit("debug", msg, context),
  info: (msg: string, context?: Record<string, unknown>) => emit("info", msg, context),
  warn: (msg: string, context?: Record<string, unknown>) => emit("warn", msg, context),
  error: (msg: string, context?: Record<string, unknown>) => emit("error", msg, context),
};

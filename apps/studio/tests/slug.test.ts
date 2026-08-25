import { describe, expect, it } from "vitest";
import { generateSlug, isValidSlug } from "@/lib/resume/slug";

describe("slug", () => {
  it("generates valid slugs", () => {
    for (let i = 0; i < 50; i++) {
      expect(isValidSlug(generateSlug())).toBe(true);
    }
  });
  it("rejects uppercase, spaces, and path characters", () => {
    expect(isValidSlug("Nope")).toBe(false);
    expect(isValidSlug("a b")).toBe(false);
    expect(isValidSlug("a/../b")).toBe(false);
    expect(isValidSlug("-lead")).toBe(false);
    expect(isValidSlug("")).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import {
  coerceResumeData,
  coerceTemplate,
  documentSchema,
  emptyResume,
} from "@/lib/resume/schema";
import { sampleResume } from "@/lib/resume/sample";

describe("resume schema", () => {
  it("produces a complete empty resume", () => {
    const empty = emptyResume();
    expect(empty.profile.fullName).toBe("");
    expect(empty.experience).toEqual([]);
    expect(empty.custom).toEqual([]);
  });

  it("round-trips the sample through JSON without loss", () => {
    const sample = sampleResume();
    const parsed = coerceResumeData(JSON.parse(JSON.stringify(sample)));
    expect(parsed).toEqual(sample);
  });

  it("recovers an empty resume from malformed input instead of throwing", () => {
    expect(coerceResumeData(null)).toEqual(emptyResume());
    expect(coerceResumeData("garbage")).toEqual(emptyResume());
    expect(coerceResumeData({ experience: "not-an-array" })).toEqual(emptyResume());
  });

  it("coerces unknown template ids to classic", () => {
    expect(coerceTemplate("classic")).toBe("classic");
    expect(coerceTemplate("executive")).toBe("executive");
    expect(coerceTemplate("comic-sans")).toBe("classic");
    expect(coerceTemplate(undefined)).toBe("classic");
  });

  it("validates a stored document envelope", () => {
    const doc = {
      id: "abc",
      title: "T",
      template: "compact",
      data: sampleResume(),
      isPublic: false,
      slug: null,
      createdAt: "2026-08-25T00:00:00.000Z",
      updatedAt: "2026-08-25T00:00:00.000Z",
    };
    expect(documentSchema.parse(doc).template).toBe("compact");
  });
});

import { describe, expect, it } from "vitest";
import { resumeToDocxBuffer } from "@/lib/export/docx";
import { sampleResume } from "@/lib/resume/sample";
import { emptyResume } from "@/lib/resume/schema";

describe("resumeToDocxBuffer", () => {
  it("produces a valid non-empty DOCX (zip) for the sample", async () => {
    const buffer = await resumeToDocxBuffer(sampleResume());
    expect(buffer.byteLength).toBeGreaterThan(1000);
    // DOCX is a zip: PK\x03\x04 magic.
    expect(buffer[0]).toBe(0x50);
    expect(buffer[1]).toBe(0x4b);
  });

  it("handles an empty resume without throwing", async () => {
    const buffer = await resumeToDocxBuffer(emptyResume());
    expect(buffer.byteLength).toBeGreaterThan(500);
  });
});

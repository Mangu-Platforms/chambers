import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { reportAsText, scoreAts } from "./ats.ts";
import { diffResumes } from "./diff.ts";
import { letterDocx, resumeDocx } from "./export-docx.ts";
import { letterAsText, resumeAsMarkdown, resumeAsText } from "./export-text.ts";
import { highlightTerms } from "./highlight.ts";
import { ingestResumeInput } from "./ingest.ts";
import { inferTargets } from "./infer.ts";
import { fromJsonResume, importAnyJson, makePack, parseChambersPack, toJsonResume } from "./json-io.ts";
import { canPromote, classifyKeywords, withPromotedSkill } from "./keywords.ts";
import { writeLetterLocal } from "./letter-local.ts";
import { parseResumeText } from "./parse.ts";
import { bulletHint, hintLine, looksLikeEmail, stripProtocol, wordCount } from "./quality.ts";
import { emptyResume, SAMPLE_JD_EDITORIAL, sampleResume } from "./sample.ts";
import { tailorLocal } from "./tailor-local.ts";
import { tidyResume } from "./tidy.ts";
import { crc32, zipStore } from "./zip.ts";

describe("parseResumeText", () => {
  it("pulls identity and a job from labeled sections", () => {
    const text = `Avery Lang
Editorial systems · product operations
Newark / remote
avery@mangu.example

SUMMARY
Operator who ships editorial systems.

EXPERIENCE
Operating lead — Mangu Platforms — Newark, NJ — 2023 — Present
Shipped a reader storefront used on live titles.
Defined the house visual language.

EDUCATION
B.A., Literature — The New School — 2016

SKILLS
Figma, InDesign, EPUB 3, Next.js
`;
    const r = parseResumeText(text);
    assert.equal(r.identity.name, "Avery Lang");
    assert.match(r.identity.email, /avery@/);
    assert.ok(r.summary.toLowerCase().includes("editorial"));
    assert.ok(r.experience.length >= 1);
    assert.ok(r.skills.some((s) => /figma/i.test(s)));
  });

  it("returns empty-ish resume for blank input", () => {
    const r = parseResumeText("   \n");
    assert.equal(r.identity.name, "");
    assert.equal(r.experience.length, 0);
  });

  it("reads LinkedIn-ish role + company · full-time", () => {
    const text = `Maya Chen
Staff frontend
maya@x.test

EXPERIENCE
Staff frontend
Northwind · Full-time
Jan 2022 - Present · 4 yrs
Remote
Led the token pipeline for five products.

EDUCATION
B.S., Computer Science — NYU — 2016

SKILLS
TypeScript, React
`;
    const r = parseResumeText(text);
    assert.ok(r.experience.length >= 1);
    assert.match(r.experience[0].org, /Northwind/i);
    assert.match(r.experience[0].end, /Present/i);
  });

  it("captures certifications as an extra section", () => {
    const text = `Pat Lee
Engineer
pat@x.test

EXPERIENCE
Engineer — Acme — 2020 — Present
Shipped the API.

CERTIFICATIONS
AWS Solutions Architect
`;
    const r = parseResumeText(text);
    assert.ok(r.extras.some((x) => /cert/i.test(x.label)));
  });
});

describe("ingestResumeInput", () => {
  it("detects a Chambers pack", () => {
    const pack = makePack({
      resume: sampleResume(),
      templateId: "letter",
      jobDescription: "",
      targetCompany: "",
      targetRole: "",
      letter: writeLetterLocal(sampleResume(), "", "Acme", "Designer"),
      notes: null,
    });
    const result = ingestResumeInput(JSON.stringify(pack));
    assert.equal(result.source, "json-pack");
    assert.equal(result.resume.identity.name, "Avery Lang");
  });

  it("detects JSON Resume", () => {
    const result = ingestResumeInput(
      JSON.stringify({
        basics: { name: "Pat Lee", email: "pat@x.test" },
        work: [{ name: "Acme", position: "Engineer", startDate: "2020" }],
      }),
    );
    assert.equal(result.source, "json-resume");
    assert.equal(result.resume.identity.name, "Pat Lee");
  });

  it("falls back to text parse", () => {
    const result = ingestResumeInput("Pat Lee\nEngineer\npat@x.test\n");
    assert.equal(result.source, "text");
    assert.equal(result.resume.identity.name, "Pat Lee");
  });
});

describe("inferTargets", () => {
  it("reads company and role from the editorial sample posting", () => {
    const t = inferTargets(SAMPLE_JD_EDITORIAL);
    assert.match(t.role, /Senior Product Designer/i);
    assert.match(t.company, /Acme Press Systems/i);
  });
});

describe("scoreAts", () => {
  it("scores the sample resume against its own posting above a weak baseline", () => {
    const report = scoreAts(sampleResume(), SAMPLE_JD_EDITORIAL);
    assert.ok(report.score >= 40);
    assert.ok(report.checks.length >= 8);
    assert.ok(report.matched.length + report.missing.length > 0);
    assert.ok(report.checks.some((c) => c.id === "keywords"));
    assert.ok(report.checks.some((c) => c.id === "dates"));
  });

  it("fails contact when email is missing", () => {
    const r = emptyResume();
    r.identity.name = "X";
    const report = scoreAts(r, "");
    const contact = report.checks.find((c) => c.id === "contact");
    assert.equal(contact?.pass, false);
  });

  it("serializes a report as text", () => {
    const t = reportAsText(scoreAts(sampleResume(), SAMPLE_JD_EDITORIAL), "Avery");
    assert.match(t, /ATS check — Avery/);
    assert.match(t, /Score /);
    assert.match(t, /do not invent|Present:/);
  });
});

describe("keywords honesty", () => {
  it("will not promote a phrase that is not evidenced", () => {
    const r = sampleResume();
    assert.equal(canPromote(r, "kubernetes"), false);
    assert.equal(withPromotedSkill(r, "kubernetes"), null);
  });

  it("will promote a phrase already in the work", () => {
    const r = sampleResume();
    assert.equal(canPromote(r, "storefront"), true);
    const next = withPromotedSkill(r, "storefront");
    assert.ok(next?.skills.includes("storefront"));
    assert.equal(r.skills.includes("storefront"), false);
  });

  it("classifies posting phrases into buckets", () => {
    const buckets = classifyKeywords(sampleResume(), SAMPLE_JD_EDITORIAL);
    assert.ok(buckets.coverage >= 0);
    assert.ok(buckets.inSkills.length + buckets.inBody.length + buckets.missing.length > 0);
    assert.equal(buckets.inBody.includes("systems"), false);
  });
});

describe("quality", () => {
  it("flags a weak opener", () => {
    const h = bulletHint("Responsible for the storefront.");
    assert.equal(h?.verb, false);
    assert.ok(hintLine(h!));
  });

  it("accepts an action bullet with a figure", () => {
    const h = bulletHint("Led a 40% cut in cycle time by replacing one-off files.");
    assert.equal(h?.verb, true);
    assert.equal(h?.metric, true);
    assert.equal(hintLine(h!), null);
  });

  it("counts words", () => {
    assert.equal(wordCount("one two three"), 3);
    assert.equal(wordCount("  "), 0);
  });

  it("validates email loosely", () => {
    assert.equal(looksLikeEmail(""), true);
    assert.equal(looksLikeEmail("avery@mangu.example"), true);
    assert.equal(looksLikeEmail("not-an-email"), false);
  });

  it("strips protocols from urls", () => {
    assert.equal(stripProtocol("https://mangu.example/avery"), "mangu.example/avery");
    assert.equal(stripProtocol("linkedin.com/in/avery/"), "linkedin.com/in/avery");
  });
});

describe("tailorLocal", () => {
  it("does not invent a new employer", () => {
    const src = sampleResume();
    const orgs = new Set(src.experience.map((j) => j.org));
    const { resume, notes } = tailorLocal(src, SAMPLE_JD_EDITORIAL);
    for (const job of resume.experience) assert.ok(orgs.has(job.org));
    assert.ok(typeof notes.summary === "string");
  });

  it("tightens weak openers", () => {
    const src = sampleResume();
    src.experience[0].bullets[0] = "Responsible for shipping the storefront.";
    const { resume, notes } = tailorLocal(src, SAMPLE_JD_EDITORIAL);
    assert.match(resume.experience[0].bullets.join(" "), /^Led |Led /);
    assert.ok(notes.rewrote.length >= 1);
  });
});

describe("writeLetterLocal", () => {
  it("stays on the facts and fills company/role", () => {
    const letter = writeLetterLocal(sampleResume(), SAMPLE_JD_EDITORIAL, "", "", "calm");
    assert.match(letter.company, /Acme/i);
    assert.match(letter.role, /Designer/i);
    assert.ok(letter.paragraphs.length >= 2);
    assert.doesNotMatch(letter.paragraphs.join(" "), /passionate|leverage|dynamic/i);
  });

  it("changes opening by tone", () => {
    const calm = writeLetterLocal(sampleResume(), SAMPLE_JD_EDITORIAL, "Acme", "Designer", "calm");
    const direct = writeLetterLocal(sampleResume(), SAMPLE_JD_EDITORIAL, "Acme", "Designer", "direct");
    const warm = writeLetterLocal(sampleResume(), SAMPLE_JD_EDITORIAL, "Acme", "Designer", "warm");
    assert.notEqual(calm.paragraphs[0], direct.paragraphs[0]);
    assert.notEqual(calm.greeting, warm.greeting);
  });
});

describe("export", () => {
  it("resumeAsText includes name and a bullet", () => {
    const t = resumeAsText(sampleResume());
    assert.match(t, /Avery Lang/);
    assert.match(t, /SELECTED WORK/);
  });

  it("resumeAsMarkdown has headings", () => {
    const t = resumeAsMarkdown(sampleResume());
    assert.match(t, /^# Avery Lang/m);
    assert.match(t, /## Selected work/);
  });

  it("letterAsText includes greeting", () => {
    const letter = writeLetterLocal(sampleResume(), SAMPLE_JD_EDITORIAL, "Acme", "Designer");
    const t = letterAsText(letter, "Avery Lang");
    assert.match(t, /Dear /);
    assert.match(t, /Avery/);
  });
});

describe("json pack", () => {
  it("round-trips a Chambers pack including tone and density", () => {
    const pack = makePack({
      resume: sampleResume(),
      templateId: "editorial",
      jobDescription: SAMPLE_JD_EDITORIAL,
      targetCompany: "Acme",
      targetRole: "Designer",
      letter: writeLetterLocal(sampleResume(), SAMPLE_JD_EDITORIAL, "Acme", "Designer"),
      notes: null,
      letterTone: "warm",
      density: "tight",
    });
    const parsed = parseChambersPack(JSON.parse(JSON.stringify(pack)));
    assert.ok(parsed);
    assert.equal(parsed?.resume.identity.name, "Avery Lang");
    assert.equal(parsed?.templateId, "editorial");
    assert.equal(parsed?.letterTone, "warm");
    assert.equal(parsed?.density, "tight");
  });

  it("imports JSON Resume basics + work", () => {
    const r = fromJsonResume({
      basics: { name: "Maya Chen", label: "Staff engineer", email: "maya@x.test", summary: "Ships systems." },
      work: [{ name: "Northwind", position: "Staff frontend", startDate: "2022-01-01", highlights: ["Led tokens."] }],
      skills: [{ name: "TypeScript" }],
    });
    assert.equal(r?.identity.name, "Maya Chen");
    assert.equal(r?.experience[0]?.org, "Northwind");
    assert.ok(r?.skills.includes("TypeScript"));
  });

  it("importAnyJson rejects garbage", () => {
    assert.equal(importAnyJson("not json"), null);
  });

  it("toJsonResume round-trips a name and a job", () => {
    const src = sampleResume();
    const jr = toJsonResume(src);
    const back = fromJsonResume(jr);
    assert.equal(back?.identity.name, src.identity.name);
    assert.equal(back?.experience[0]?.org, src.experience[0].org);
    assert.ok((back?.skills.length ?? 0) >= 1);
  });
});

describe("tidy", () => {
  it("drops empty bullets and blank extras without touching facts", () => {
    const r = sampleResume();
    r.experience[0].bullets.push("  ", "");
    r.extras.push({ id: "x", label: "  ", items: ["", " "] });
    const t = tidyResume(r);
    assert.equal(t.experience[0].bullets.includes(""), false);
    assert.ok(!t.extras.some((x) => !x.label && x.items.length === 0));
    assert.equal(t.identity.name, r.identity.name);
  });
});

describe("zip / docx", () => {
  it("crc32 is stable", () => {
    assert.equal(crc32(new TextEncoder().encode("123456789")), 0xcbf43926);
  });

  it("zip starts with PK and contains the file name", () => {
    const z = zipStore([{ name: "hello.txt", data: new TextEncoder().encode("hi") }]);
    assert.equal(z[0], 0x50);
    assert.equal(z[1], 0x4b);
    assert.ok(new TextDecoder().decode(z).includes("hello.txt"));
  });

  it("resumeDocx is a zip with document.xml", () => {
    const bytes = resumeDocx(sampleResume());
    const text = new TextDecoder().decode(bytes);
    assert.equal(bytes[0], 0x50);
    assert.ok(text.includes("word/document.xml"));
    assert.ok(text.includes("Avery Lang"));
  });

  it("letterDocx includes greeting", () => {
    const letter = writeLetterLocal(sampleResume(), SAMPLE_JD_EDITORIAL, "Acme", "Designer");
    const text = new TextDecoder().decode(letterDocx(letter, "Avery Lang"));
    assert.ok(text.includes("Dear"));
  });
});

describe("highlight + diff", () => {
  it("marks matching terms", () => {
    const parts = highlightTerms("Design tokens and print CSS", ["tokens", "print"]);
    assert.ok(parts.some((p) => p.hit && /tokens/i.test(p.text)));
  });

  it("detects a raised bullet", () => {
    const a = sampleResume();
    const b = sampleResume();
    const first = b.experience[0].bullets[0];
    b.experience[0].bullets = [b.experience[0].bullets[1], first, ...b.experience[0].bullets.slice(2)];
    const d = diffResumes(a, b);
    assert.ok(d.bullets.some((x) => x.kind === "raised"));
  });
});

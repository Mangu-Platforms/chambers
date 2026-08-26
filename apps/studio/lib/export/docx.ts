import {
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TabStopType,
  TextRun,
} from "docx";
import type { ResumeData } from "@/lib/resume/schema";
import { cleanLine, cleanUrl, displayUrl } from "@/lib/resume/sanitize";

/**
 * DOCX export — ATS-first: real headings, plain paragraphs, standard bullets,
 * no text boxes, no tables, no images. Colors limited to ink + ember.
 */

const INK = "1D1D1F";
const EMBER = "C63A00";
const MUTED = "6E6E73";

const RIGHT_TAB = 10800; // ~7.5in in twips — right-aligned dates

function range(start: string, end: string): string {
  const s = cleanLine(start);
  const e = cleanLine(end);
  if (s && e) return `${s} - ${e}`;
  return s || e || "";
}

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 4, color: EMBER, space: 4 },
    },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        color: EMBER,
        size: 18,
        font: "Helvetica",
      }),
    ],
  });
}

function entryLine(left: string, right: string): Paragraph {
  const children: TextRun[] = [
    new TextRun({ text: left, bold: true, color: INK, size: 22, font: "Helvetica" }),
  ];
  if (right) {
    children.push(new TextRun({ text: `\t${right}`, color: MUTED, size: 18, font: "Helvetica" }));
  }
  return new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: RIGHT_TAB }],
    spacing: { before: 120, after: 20 },
    children,
  });
}

function subLine(text: string): Paragraph {
  return new Paragraph({
    spacing: { after: 60 },
    children: [new TextRun({ text, color: MUTED, size: 18, font: "Helvetica" })],
  });
}

function bullet(text: string): Paragraph {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 40 },
    children: [new TextRun({ text, color: INK, size: 21, font: "Helvetica" })],
  });
}

function bodyLine(text: string): Paragraph {
  return new Paragraph({
    spacing: { after: 60 },
    children: [new TextRun({ text, color: INK, size: 21, font: "Helvetica" })],
  });
}

export function buildDocx(data: ResumeData): Document {
  const p = data.profile;
  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: cleanLine(p.fullName) || "Resume",
          bold: true,
          color: INK,
          size: 52,
          font: "Helvetica",
        }),
      ],
    }),
  );
  if (cleanLine(p.headline)) {
    children.push(subLine(cleanLine(p.headline)));
  }
  const contactBits = [cleanLine(p.location), cleanLine(p.email), cleanLine(p.phone)].filter(Boolean);
  for (const link of p.links) {
    const url = cleanUrl(link.url);
    if (url) contactBits.push(displayUrl(url));
  }
  if (contactBits.length > 0) {
    children.push(subLine(contactBits.join("  ·  ")));
  }

  if (cleanLine(p.summary)) {
    children.push(sectionHeading("Summary"), bodyLine(cleanLine(p.summary)));
  }

  if (data.experience.length > 0) {
    children.push(sectionHeading("Experience"));
    for (const job of data.experience) {
      children.push(entryLine(cleanLine(job.role) || "Role", range(job.start, job.end)));
      const org = [cleanLine(job.organization), cleanLine(job.location)].filter(Boolean).join(", ");
      if (org) children.push(subLine(org));
      for (const b of job.bullets) {
        if (cleanLine(b)) children.push(bullet(cleanLine(b)));
      }
    }
  }

  if (data.projects.length > 0) {
    children.push(sectionHeading("Projects"));
    for (const project of data.projects) {
      const url = cleanUrl(project.url);
      children.push(entryLine(cleanLine(project.name) || "Project", url ? displayUrl(url) : ""));
      if (cleanLine(project.description)) children.push(subLine(cleanLine(project.description)));
      for (const b of project.bullets) {
        if (cleanLine(b)) children.push(bullet(cleanLine(b)));
      }
    }
  }

  if (data.education.length > 0) {
    children.push(sectionHeading("Education"));
    for (const ed of data.education) {
      children.push(entryLine(cleanLine(ed.degree) || "Degree", range(ed.start, ed.end)));
      const inst = [cleanLine(ed.institution), cleanLine(ed.location)].filter(Boolean).join(", ");
      if (inst) children.push(subLine(inst));
      if (cleanLine(ed.notes)) children.push(subLine(cleanLine(ed.notes)));
    }
  }

  const skills = data.skills.map((s) => cleanLine(s.name)).filter(Boolean);
  if (skills.length > 0) {
    children.push(sectionHeading("Skills"), bodyLine(skills.join(", ")));
  }

  for (const section of data.custom) {
    if (!cleanLine(section.title) && section.items.length === 0) continue;
    children.push(sectionHeading(cleanLine(section.title) || "Additional"));
    for (const item of section.items) {
      children.push(entryLine(cleanLine(item.heading), cleanLine(item.when)));
      if (cleanLine(item.sub)) children.push(subLine(cleanLine(item.sub)));
      for (const b of item.bullets) {
        if (cleanLine(b)) children.push(bullet(cleanLine(b)));
      }
    }
  }

  return new Document({
    styles: {
      default: {
        document: { run: { font: "Helvetica", color: INK } },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 },
          },
        },
        children,
      },
    ],
  });
}

export async function resumeToDocxBlob(data: ResumeData): Promise<Blob> {
  return Packer.toBlob(buildDocx(data));
}

export async function resumeToDocxBuffer(data: ResumeData): Promise<Uint8Array> {
  const buffer = await Packer.toBuffer(buildDocx(data));
  return new Uint8Array(buffer);
}

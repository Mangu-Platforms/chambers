import type { CoverLetter, Resume } from "./types";
import { zipStore } from "./zip";

const AMP = "\u0026";

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, `${AMP}amp;`)
    .replace(/</g, `${AMP}lt;`)
    .replace(/>/g, `${AMP}gt;`)
    .replace(/"/g, `${AMP}quot;`);
}

function p(text: string, opts?: { bold?: boolean; size?: number; after?: number }): string {
  const sz = opts?.size ?? 22;
  const after = opts?.after ?? 80;
  const run = `<w:r><w:rPr><w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/>${
    opts?.bold ? "<w:b/>" : ""
  }</w:rPr><w:t xml:space="preserve">${xmlEscape(text)}</w:t></w:r>`;
  return `<w:p><w:pPr><w:spacing w:after="${after}"/></w:pPr>${run}</w:p>`;
}

function heading(text: string): string {
  return p(text.toUpperCase(), { bold: true, size: 20, after: 60 });
}

function bodyXml(paragraphs: string[]): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${paragraphs.join("")}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720"/>
    </w:sectPr>
  </w:body>
</w:document>`;
}

function packageDocx(documentXml: string): Uint8Array {
  const enc = new TextEncoder();
  return zipStore([
    {
      name: "[Content_Types].xml",
      data: enc.encode(`<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`),
    },
    {
      name: "_rels/.rels",
      data: enc.encode(`<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`),
    },
    { name: "word/document.xml", data: enc.encode(documentXml) },
  ]);
}

export function resumeDocx(resume: Resume): Uint8Array {
  const i = resume.identity;
  const blocks: string[] = [];
  if (i.name) blocks.push(p(i.name, { bold: true, size: 36, after: 40 }));
  if (i.title) blocks.push(p(i.title, { size: 22, after: 40 }));
  const contact = [i.location, i.email, i.phone, i.website, i.linkedin].filter(Boolean).join("  ·  ");
  if (contact) blocks.push(p(contact, { size: 18, after: 200 }));
  if (resume.summary) {
    blocks.push(heading("Summary"));
    blocks.push(p(resume.summary, { after: 200 }));
  }
  if (resume.experience.length) {
    blocks.push(heading("Selected work"));
    for (const job of resume.experience) {
      const when = [job.start, job.end].filter(Boolean).join(" — ");
      blocks.push(p([job.role, job.org].filter(Boolean).join(" · "), { bold: true, after: 40 }));
      const sub = [job.location, when].filter(Boolean).join("  ·  ");
      if (sub) blocks.push(p(sub, { size: 18, after: 40 }));
      for (const b of job.bullets.filter(Boolean)) blocks.push(p(`• ${b}`, { after: 60 }));
    }
  }
  if (resume.education.length) {
    blocks.push(heading("Education"));
    for (const ed of resume.education) {
      blocks.push(p([ed.degree, ed.school, ed.year].filter(Boolean).join(" · "), { bold: true, after: 40 }));
      if (ed.detail) blocks.push(p(ed.detail, { size: 18, after: 80 }));
    }
  }
  if (resume.skills.filter(Boolean).length) {
    blocks.push(heading("Skills"));
    blocks.push(p(resume.skills.filter(Boolean).join(" · ")));
  }
  for (const x of resume.extras) {
    const items = x.items.filter(Boolean);
    if (!x.label && !items.length) continue;
    blocks.push(heading(x.label || "Additional"));
    for (const it of items) blocks.push(p(`• ${it}`));
  }
  return packageDocx(bodyXml(blocks));
}

export function letterDocx(letter: CoverLetter, name: string): Uint8Array {
  const blocks: string[] = [];
  if (name) blocks.push(p(name, { bold: true, size: 32, after: 40 }));
  if (letter.role || letter.company) {
    blocks.push(p([letter.role, letter.company].filter(Boolean).join(" · "), { after: 160 }));
  }
  blocks.push(p(`Dear ${letter.greeting || "Hiring team"},`, { after: 160 }));
  for (const para of letter.paragraphs.filter(Boolean)) blocks.push(p(para, { after: 160 }));
  if (letter.closing) blocks.push(p(letter.closing, { after: 160 }));
  const sign = (letter.signoff || "Sincerely").split("\n");
  for (const line of sign) blocks.push(p(line, { after: 40 }));
  if (name && !sign.some((l) => l.includes(name.split(" ")[0] ?? ""))) blocks.push(p(name, { after: 40 }));
  return packageDocx(bodyXml(blocks));
}

export function downloadBytes(filename: string, bytes: Uint8Array, mime: string) {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const blob = new Blob([copy.buffer], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function slugName(name: string, fallback: string): string {
  const s = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return s || fallback;
}

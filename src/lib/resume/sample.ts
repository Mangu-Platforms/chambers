import type { CoverLetter, Resume } from "./types";

export function emptyResume(): Resume {
  return {
    identity: {
      name: "",
      title: "",
      location: "",
      email: "",
      phone: "",
      website: "",
      linkedin: "",
    },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    extras: [],
  };
}

export function sampleResume(): Resume {
  return {
    identity: {
      name: "Avery Lang",
      title: "Editorial systems · product operations · design",
      location: "Newark / remote",
      email: "avery@mangu.example",
      phone: "973.555.0142",
      website: "mangu.example/avery",
      linkedin: "linkedin.com/in/averylang",
    },
    summary:
      "Product operator who ships editorial systems — reader storefronts, production boards, and a house visual language other teams consume as tokens. Cuts cycle time by replacing one-off rituals with checked pipelines, without sanding off the voice of the work.",
    experience: [
      {
        id: "exp-mangu",
        role: "Operating lead, independent press",
        org: "Mangu Platforms",
        location: "Newark, NJ",
        start: "2023",
        end: "Present",
        bullets: [
          "Shipped a reader storefront and production board used on live titles, replacing a spreadsheet-and-Slack ritual.",
          "Defined the house visual language now consumed as Chambers tokens across five products — one hairline, no forked hex.",
          "Cut typesetting-to-EPUB cycle time 40% by replacing one-off InDesign files with a checked pipeline and print stylesheet.",
          "Ran hiring loops, vendor QC, and edition planning for print, EPUB, and audio on a shared seasonal list.",
        ],
      },
      {
        id: "exp-house",
        role: "Studio producer",
        org: "House audio & print",
        location: "Brooklyn, NY",
        start: "2019",
        end: "2023",
        bullets: [
          "Ran chapter QC, narrator selection, and ACX-safe mastering profiles for 18 titles.",
          "Built pronunciation dictionaries that held across 14-chapter productions — fix a name once, keep it forever.",
          "Coordinated freelance designers, narrators, and typesetters on a single production board with restart-safe jobs.",
        ],
      },
      {
        id: "exp-editorial",
        role: "Editorial assistant",
        org: "Small press consortium",
        location: "New York, NY",
        start: "2016",
        end: "2019",
        bullets: [
          "Managed manuscript intake and copy decks for a 12-title seasonal list.",
          "Designed interior templates that became the house default for trade paperbacks.",
        ],
      },
    ],
    education: [
      {
        id: "edu-newschool",
        school: "The New School",
        degree: "B.A., Literature",
        year: "2016",
        detail: "Thesis on editorial systems in independent publishing",
      },
    ],
    skills: [
      "Figma",
      "InDesign",
      "EPUB 3",
      "Next.js",
      "Design tokens",
      "Production ops",
      "Copy editing",
      "Vendor management",
      "ATS-safe layout",
      "Print production",
    ],
    extras: [
      {
        id: "extra-highlights",
        label: "Highlights",
        items: [
          "Chambers design language — tokens, letter-width resume sheet, hairline system",
          "Voice City production board — chapter QC, locked narrator versions",
        ],
      },
    ],
  };
}

export function sampleEngineerResume(): Resume {
  return {
    identity: {
      name: "Maya Chen",
      title: "Staff frontend engineer · design systems",
      location: "Austin / remote",
      email: "maya.chen@example.com",
      phone: "512.555.0194",
      website: "mayachen.dev",
      linkedin: "linkedin.com/in/mayachen",
    },
    summary:
      "Staff frontend engineer who owns design-system platforms and document rendering. Ships TypeScript, React, and token pipelines that stay fast under print-quality layout constraints — ATS-safe, pixel-honest, and cheap to run.",
    experience: [
      {
        id: "exp-northwind",
        role: "Staff frontend engineer",
        org: "Northwind Labs",
        location: "Austin, TX",
        start: "2022",
        end: "Present",
        bullets: [
          "Led the design-token pipeline (CSS + JSON) consumed by 6 product surfaces; cut hex drift to zero.",
          "Rebuilt a document renderer for letter-width paper with print CSS, dropping PDF generation from 8s to 400ms.",
          "Mentored 4 engineers; introduced typed contract tests that caught 12 layout regressions before release.",
          "Partnered with design on an ATS-safe template system used on 30k generated resumes / month.",
        ],
      },
      {
        id: "exp-harbor",
        role: "Senior software engineer",
        org: "Harbor & Co.",
        location: "Remote",
        start: "2019",
        end: "2022",
        bullets: [
          "Shipped a React + TypeScript editor with undo, structured JSON, and live preview for hiring tools.",
          "Reduced LCP from 3.8s to 1.1s by deleting client JS from marketing drops and inlining tokens.",
          "Owned CI for visual snapshots of letter sheets across 5 templates.",
        ],
      },
      {
        id: "exp-pixelplain",
        role: "Software engineer",
        org: "Pixelplain",
        location: "San Francisco, CA",
        start: "2016",
        end: "2019",
        bullets: [
          "Built component libraries in React with full keyboard access and AA contrast.",
          "Wrote Python ETL that scored job-description keyword coverage for a recruiting product.",
        ],
      },
    ],
    education: [
      {
        id: "edu-ut",
        school: "University of Texas at Austin",
        degree: "B.S., Computer Science",
        year: "2016",
        detail: "",
      },
    ],
    skills: [
      "TypeScript",
      "React",
      "CSS",
      "Design systems",
      "Node.js",
      "Python",
      "Playwright",
      "Vite",
      "Accessibility",
      "Performance",
    ],
    extras: [
      {
        id: "extra-oss",
        label: "Open source",
        items: [
          "paper-css — print stylesheet for US Letter at 96dpi",
          "token-lint — fails CI when hex is forked from the source of truth",
        ],
      },
    ],
  };
}

export const DEMO_RESUME: Resume = sampleResume();

export const SAMPLE_TARGET_EDITORIAL = {
  company: "Acme Press Systems",
  role: "Senior Product Designer",
};

export const SAMPLE_TARGET_ENGINEER = {
  company: "Lumen Hire",
  role: "Staff Frontend Engineer",
};

export const SAMPLE_JD_EDITORIAL = `Senior Product Designer, Editorial Tools
Acme Press Systems — Remote

We're hiring a senior product designer who can own the resume-to-publication pipeline. You will design ATS-safe document systems and letter-width paper layouts, partner with engineers on Next.js and design-token pipelines, and run production QC for print and digital editions.

Requirements:
- 5+ years product or editorial design
- Figma and design systems
- Experience with EPUB, print production, or document rendering
- Comfort writing crisp product copy and running hiring loops
- Vendor management and InDesign a plus

Nice to have: token systems, ATS-safe layout, production operations, copy editing.`;

export const SAMPLE_JD_ENGINEER = `Staff Frontend Engineer, Document Platform
Lumen Hire — San Francisco / Remote

Build the rendering engine behind tailored resumes and cover letters. You will own TypeScript/React document layout, print CSS, design-token pipelines, and ATS-safe template systems at 30k+ documents a month.

Requirements:
- Staff-level frontend: TypeScript, React, CSS
- Design systems and token pipelines
- Performance (LCP, print-quality layout without heavy client JS)
- Accessibility (keyboard, AA contrast)
- Experience with Playwright or visual snapshot testing

Nice to have: Node.js, Python, Vite, PDF/print stylesheets, mentoring.`;

export function emptyLetter(): CoverLetter {
  return {
    company: "",
    role: "",
    greeting: "Hiring team",
    paragraphs: [],
    closing: "Thank you for your time.",
    signoff: "Sincerely",
  };
}

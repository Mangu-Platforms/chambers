import type { ResumeData } from "./schema";

/**
 * "Avery Lang" — the clearly-fictional sample document.
 * Never replace this with real biography. The owner's real CV enters the product
 * only through explicit import (cv-fall2026 / paste), never by invention.
 */
export const SAMPLE_TITLE = "Avery Lang — sample";

export function sampleResume(): ResumeData {
  return {
    profile: {
      fullName: "Avery Lang",
      headline: "Editorial systems · book operations · product design",
      email: "avery@mangu.example",
      phone: "",
      location: "Newark / remote",
      links: [{ id: "l1", label: "Portfolio", url: "https://avery.example" }],
      summary:
        "Operator for small presses: takes manuscripts to storefront-ready books, and one-off design rituals to checked pipelines.",
    },
    experience: [
      {
        id: "e1",
        role: "Operating lead, independent press",
        organization: "Mangu Platforms",
        location: "Newark, NJ",
        start: "2023",
        end: "present",
        bullets: [
          "Shipped a reader storefront and production board used on live titles.",
          "Defined the house visual language now consumed as Chambers tokens.",
          "Cut typesetting-to-EPUB cycle by replacing one-off InDesign rituals with a checked pipeline.",
        ],
      },
      {
        id: "e2",
        role: "Studio producer",
        organization: "House audio & print",
        location: "",
        start: "2019",
        end: "2023",
        bullets: ["Ran chapter QC, narrator selection, and ACX-safe mastering profiles."],
      },
    ],
    education: [
      {
        id: "ed1",
        degree: "B.A., Literature",
        institution: "Placeholder — replace with facts only",
        location: "",
        start: "",
        end: "",
        notes: "",
      },
    ],
    skills: [
      { id: "s1", name: "InDesign" },
      { id: "s2", name: "EPUB 3" },
      { id: "s3", name: "Supabase" },
      { id: "s4", name: "Next.js" },
      { id: "s5", name: "Piper / ffmpeg" },
    ],
    projects: [],
    custom: [],
  };
}

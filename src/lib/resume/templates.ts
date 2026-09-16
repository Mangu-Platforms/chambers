import type { TemplateMeta } from "./types";

export const TEMPLATES: TemplateMeta[] = [
  {
    id: "letter",
    name: "Letter",
    blurb: "The Chambers sheet. Vermilion labels, quiet paper, two-column close.",
    tone: "House default",
    ats: "high",
    bestFor: "Most roles",
  },
  {
    id: "compact",
    name: "Compact",
    blurb: "Dense, single column, nothing a parser can trip on.",
    tone: "ATS first",
    ats: "high",
    bestFor: "Corporate / high volume",
  },
  {
    id: "executive",
    name: "Executive",
    blurb: "Night header, cream name, one hairline. Calm authority.",
    tone: "Leadership",
    ats: "medium",
    bestFor: "Senior & director",
  },
  {
    id: "editorial",
    name: "Editorial",
    blurb: "Huge name, generous tracking, skills as a sentence.",
    tone: "Magazine",
    ats: "high",
    bestFor: "Design, writing, brand",
  },
  {
    id: "sidebar",
    name: "Sidebar",
    blurb: "Cream rail for contact and skills. Paper for the work.",
    tone: "Portfolio",
    ats: "medium",
    bestFor: "Creative, product",
  },
  {
    id: "classic",
    name: "Classic",
    blurb: "Centered name, double rules, no decoration. Recruiter-native.",
    tone: "Traditional",
    ats: "high",
    bestFor: "Law, finance, academia",
  },
];

export function templateMeta(id: string): TemplateMeta {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}

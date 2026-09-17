import type { Resume } from "./types";

/** Drop empty bullets, blank roles, blank extras. Never invents content. */
export function tidyResume(resume: Resume): Resume {
  return {
    identity: {
      name: resume.identity.name.trim(),
      title: resume.identity.title.trim(),
      location: resume.identity.location.trim(),
      email: resume.identity.email.trim(),
      phone: resume.identity.phone.trim(),
      website: resume.identity.website.trim(),
      linkedin: resume.identity.linkedin.trim(),
    },
    summary: resume.summary.trim(),
    experience: resume.experience
      .map((j) => ({
        ...j,
        role: j.role.trim(),
        org: j.org.trim(),
        location: j.location.trim(),
        start: j.start.trim(),
        end: j.end.trim(),
        bullets: j.bullets.map((b) => b.trim()).filter(Boolean),
      }))
      .filter((j) => j.role || j.org || j.bullets.length),
    education: resume.education
      .map((e) => ({
        ...e,
        school: e.school.trim(),
        degree: e.degree.trim(),
        year: e.year.trim(),
        detail: e.detail.trim(),
      }))
      .filter((e) => e.school || e.degree),
    skills: [...new Set(resume.skills.map((s) => s.trim()).filter(Boolean))],
    extras: resume.extras
      .map((x) => ({
        ...x,
        label: x.label.trim(),
        items: x.items.map((i) => i.trim()).filter(Boolean),
      }))
      .filter((x) => x.label || x.items.length),
  };
}

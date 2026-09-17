import { create } from "zustand";
import { persist, type PersistStorage, type StorageValue } from "zustand/middleware";
import { canPromote } from "./keywords";
import { tidyResume } from "./tidy";
import { uid } from "./ids";
import { inferTargets } from "./infer";
import { cloneResume } from "./normalize";
import { emptyLetter, sampleResume } from "./sample";
import { makePack, type ChambersPack } from "./json-io";
import type {
  CoverLetter,
  Density,
  EducationItem,
  ExperienceItem,
  ExtraSection,
  LetterTone,
  Resume,
  ResumeIdentity,
  SavedVersion,
  TailorNotes,
  TemplateId,
} from "./types";

const VERSION_CAP = 20;

type State = {
  hydrated: boolean;
  resume: Resume;
  master: Resume;
  snapshot: Resume | null;
  notes: TailorNotes | null;
  templateId: TemplateId;
  density: Density;
  jobDescription: string;
  targetCompany: string;
  targetRole: string;
  letter: CoverLetter;
  letterTone: LetterTone;
  versions: SavedVersion[];
  setHydrated: () => void;
  setResume: (resume: Resume) => void;
  patchResume: (partial: Partial<Resume>) => void;
  patchIdentity: (partial: Partial<ResumeIdentity>) => void;
  setSummary: (summary: string) => void;
  setSkills: (skills: string[]) => void;
  addSkill: (skill: string) => boolean;
  removeSkill: (skill: string) => void;
  promoteSkill: (term: string) => boolean;
  tidy: () => void;
  updateExperience: (id: string, next: ExperienceItem) => void;
  removeExperience: (id: string) => void;
  addExperience: () => void;
  duplicateExperience: (id: string) => void;
  moveExperience: (id: string, dir: -1 | 1) => void;
  moveBullet: (jobId: string, index: number, dir: -1 | 1) => void;
  replaceBullet: (jobId: string, index: number, text: string) => void;
  updateEducation: (id: string, next: EducationItem) => void;
  removeEducation: (id: string) => void;
  addEducation: () => void;
  moveEducation: (id: string, dir: -1 | 1) => void;
  updateExtra: (id: string, next: ExtraSection) => void;
  removeExtra: (id: string) => void;
  addExtra: () => void;
  moveExtra: (id: string, dir: -1 | 1) => void;
  setTemplate: (id: TemplateId) => void;
  setDensity: (density: Density) => void;
  setJobDescription: (jd: string) => void;
  setTarget: (company: string, role: string) => void;
  loadPosting: (jd: string, company: string, role: string) => void;
  setLetter: (letter: CoverLetter) => void;
  setLetterTone: (tone: LetterTone) => void;
  setNotes: (notes: TailorNotes | null) => void;
  saveMaster: () => void;
  restoreMaster: () => void;
  rememberSnapshot: () => void;
  undoTailor: () => void;
  resetSample: (resume: Resume) => void;
  saveVersion: (name?: string) => SavedVersion;
  loadVersion: (id: string) => boolean;
  deleteVersion: (id: string) => void;
  renameVersion: (id: string, name: string) => void;
  duplicateVersion: (id: string) => SavedVersion | null;
  applyPack: (pack: ChambersPack) => void;
  exportPack: () => ChambersPack;
};

type Persisted = Pick<
  State,
  | "resume"
  | "master"
  | "snapshot"
  | "notes"
  | "templateId"
  | "density"
  | "jobDescription"
  | "targetCompany"
  | "targetRole"
  | "letter"
  | "letterTone"
  | "versions"
>;

let persistTimer: ReturnType<typeof setTimeout> | undefined;
let pending: { name: string; value: string } | null = null;

function flushPersist() {
  if (!pending) return;
  try {
    localStorage.setItem(pending.name, pending.value);
  } catch {
    /* quota */
  }
  pending = null;
}

function bindFlush() {
  if (typeof window === "undefined") return;
  window.addEventListener("pagehide", flushPersist);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushPersist();
  });
}
bindFlush();

const storage: PersistStorage<Persisted> = {
  getItem: (name) => {
    flushPersist();
    try {
      const s = localStorage.getItem(name);
      return s ? (JSON.parse(s) as StorageValue<Persisted>) : null;
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    pending = { name, value: JSON.stringify(value) };
    if (persistTimer) clearTimeout(persistTimer);
    persistTimer = setTimeout(flushPersist, 400);
  },
  removeItem: (name) => {
    if (persistTimer) clearTimeout(persistTimer);
    pending = null;
    localStorage.removeItem(name);
  },
};

function defaultVersionName(s: {
  targetRole: string;
  targetCompany: string;
  resume: Resume;
}): string {
  const pair = [s.targetRole, s.targetCompany].filter(Boolean).join(" · ");
  if (pair) return pair;
  const who = s.resume.identity.name || "Untitled";
  return `${who} · ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

function snapshotOf(s: {
  resume: Resume;
  templateId: TemplateId;
  jobDescription: string;
  targetCompany: string;
  targetRole: string;
  letter: CoverLetter;
  notes: TailorNotes | null;
  letterTone: LetterTone;
  density: Density;
}): Omit<SavedVersion, "id" | "name" | "savedAt"> {
  return {
    resume: cloneResume(s.resume),
    templateId: s.templateId,
    jobDescription: s.jobDescription,
    targetCompany: s.targetCompany,
    targetRole: s.targetRole,
    letter: { ...s.letter, paragraphs: s.letter.paragraphs.slice() },
    notes: s.notes,
    letterTone: s.letterTone,
    density: s.density,
  };
}

function moveById<T extends { id: string }>(list: T[], id: string, dir: -1 | 1): T[] | null {
  const next = list.slice();
  const i = next.findIndex((x) => x.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= next.length) return null;
  const swap = next[i];
  next[i] = next[j];
  next[j] = swap;
  return next;
}

export const useResumeStore = create<State>()(
  persist(
    (set, get) => ({
      hydrated: false,
      resume: sampleResume(),
      master: sampleResume(),
      snapshot: null,
      notes: null,
      templateId: "letter",
      density: "regular",
      jobDescription: "",
      targetCompany: "",
      targetRole: "",
      letter: emptyLetter(),
      letterTone: "calm",
      versions: [],
      setHydrated: () => set({ hydrated: true }),
      setResume: (resume) => {
        set({ resume });
        flushPersist();
      },
      patchResume: (partial) => set({ resume: { ...get().resume, ...partial } }),
      patchIdentity: (partial) =>
        set((s) => ({
          resume: { ...s.resume, identity: { ...s.resume.identity, ...partial } },
        })),
      setSummary: (summary) => set((s) => ({ resume: { ...s.resume, summary } })),
      setSkills: (skills) => set((s) => ({ resume: { ...s.resume, skills } })),
      addSkill: (skill) => {
        const cleaned = skill.trim();
        if (!cleaned) return false;
        const current = get().resume.skills;
        if (current.some((s) => s.toLowerCase() === cleaned.toLowerCase())) return false;
        set((s) => ({
          resume: { ...s.resume, skills: [...s.resume.skills.filter(Boolean), cleaned].slice(0, 24) },
        }));
        return true;
      },
      removeSkill: (skill) =>
        set((s) => ({
          resume: {
            ...s.resume,
            skills: s.resume.skills.filter((x) => x !== skill),
          },
        })),
      promoteSkill: (term) => {
        const cleaned = term.trim();
        const resume = get().resume;
        if (!canPromote(resume, cleaned)) return false;
        set({
          resume: {
            ...resume,
            skills: [...resume.skills.filter(Boolean), cleaned].slice(0, 24),
          },
        });
        return true;
      },
      tidy: () => {
        set((s) => ({ resume: tidyResume(s.resume) }));
        flushPersist();
      },
      updateExperience: (id, next) =>
        set((s) => ({
          resume: {
            ...s.resume,
            experience: s.resume.experience.map((j) => (j.id === id ? next : j)),
          },
        })),
      removeExperience: (id) =>
        set((s) => ({
          resume: {
            ...s.resume,
            experience: s.resume.experience.filter((j) => j.id !== id),
          },
        })),
      addExperience: () =>
        set((s) => ({
          resume: {
            ...s.resume,
            experience: [
              {
                id: uid(),
                role: "New role",
                org: "",
                location: "",
                start: "",
                end: "",
                bullets: [""],
              },
              ...s.resume.experience,
            ],
          },
        })),
      duplicateExperience: (id) =>
        set((s) => {
          const i = s.resume.experience.findIndex((j) => j.id === id);
          if (i < 0) return s;
          const src = s.resume.experience[i];
          const copy = {
            ...src,
            id: uid(),
            role: src.role ? `${src.role}` : "New role",
            bullets: src.bullets.slice(),
          };
          const list = s.resume.experience.slice();
          list.splice(i + 1, 0, copy);
          return { resume: { ...s.resume, experience: list } };
        }),
      moveExperience: (id, dir) =>
        set((s) => {
          const list = moveById(s.resume.experience, id, dir);
          if (!list) return s;
          return { resume: { ...s.resume, experience: list } };
        }),
      moveBullet: (jobId, index, dir) =>
        set((s) => ({
          resume: {
            ...s.resume,
            experience: s.resume.experience.map((job) => {
              if (job.id !== jobId) return job;
              const j = index + dir;
              if (index < 0 || j < 0 || j >= job.bullets.length) return job;
              const bullets = job.bullets.slice();
              const swap = bullets[index];
              bullets[index] = bullets[j];
              bullets[j] = swap;
              return { ...job, bullets };
            }),
          },
        })),
      replaceBullet: (jobId, index, text) =>
        set((s) => ({
          resume: {
            ...s.resume,
            experience: s.resume.experience.map((job) => {
              if (job.id !== jobId) return job;
              const bullets = job.bullets.slice();
              if (index < 0 || index >= bullets.length) return job;
              bullets[index] = text;
              return { ...job, bullets };
            }),
          },
        })),
      updateEducation: (id, next) =>
        set((s) => ({
          resume: {
            ...s.resume,
            education: s.resume.education.map((e) => (e.id === id ? next : e)),
          },
        })),
      removeEducation: (id) =>
        set((s) => ({
          resume: {
            ...s.resume,
            education: s.resume.education.filter((e) => e.id !== id),
          },
        })),
      addEducation: () =>
        set((s) => ({
          resume: {
            ...s.resume,
            education: [
              ...s.resume.education,
              { id: uid(), school: "", degree: "", year: "", detail: "" },
            ],
          },
        })),
      moveEducation: (id, dir) =>
        set((s) => {
          const list = moveById(s.resume.education, id, dir);
          if (!list) return s;
          return { resume: { ...s.resume, education: list } };
        }),
      updateExtra: (id, next) =>
        set((s) => ({
          resume: {
            ...s.resume,
            extras: s.resume.extras.map((x) => (x.id === id ? next : x)),
          },
        })),
      removeExtra: (id) =>
        set((s) => ({
          resume: {
            ...s.resume,
            extras: s.resume.extras.filter((x) => x.id !== id),
          },
        })),
      addExtra: () =>
        set((s) => ({
          resume: {
            ...s.resume,
            extras: [...s.resume.extras, { id: uid(), label: "Additional", items: [""] }],
          },
        })),
      moveExtra: (id, dir) =>
        set((s) => {
          const list = moveById(s.resume.extras, id, dir);
          if (!list) return s;
          return { resume: { ...s.resume, extras: list } };
        }),
      setTemplate: (templateId) => {
        set({ templateId });
        flushPersist();
      },
      setDensity: (density) => {
        set({ density });
        flushPersist();
      },
      setJobDescription: (jobDescription) =>
        set((s) => {
          const inferred = inferTargets(jobDescription);
          return {
            jobDescription,
            targetCompany: s.targetCompany || inferred.company,
            targetRole: s.targetRole || inferred.role,
          };
        }),
      setTarget: (targetCompany, targetRole) => set({ targetCompany, targetRole }),
      loadPosting: (jobDescription, company, role) => {
        set({
          jobDescription,
          targetCompany: company,
          targetRole: role,
        });
        flushPersist();
      },
      setLetter: (letter) => {
        set({ letter });
        flushPersist();
      },
      setLetterTone: (letterTone) => set({ letterTone }),
      setNotes: (notes) => {
        set({ notes });
        flushPersist();
      },
      saveMaster: () => {
        set({ master: cloneResume(get().resume) });
        flushPersist();
      },
      restoreMaster: () => {
        set({ resume: cloneResume(get().master), notes: null });
        flushPersist();
      },
      rememberSnapshot: () => set({ snapshot: cloneResume(get().resume) }),
      undoTailor: () => {
        const snap = get().snapshot;
        if (snap) {
          set({ resume: cloneResume(snap), snapshot: null, notes: null });
          flushPersist();
        }
      },
      resetSample: (resume) => {
        set({
          resume: cloneResume(resume),
          master: cloneResume(resume),
          snapshot: null,
          notes: null,
          letter: emptyLetter(),
          jobDescription: "",
          targetCompany: "",
          targetRole: "",
        });
        flushPersist();
      },
      saveVersion: (name) => {
        const s = get();
        const version: SavedVersion = {
          id: uid(),
          name: (name ?? "").trim() || defaultVersionName(s),
          savedAt: new Date().toISOString(),
          ...snapshotOf(s),
        };
        set({ versions: [version, ...s.versions].slice(0, VERSION_CAP) });
        flushPersist();
        return version;
      },
      loadVersion: (id) => {
        const found = get().versions.find((v) => v.id === id);
        if (!found) return false;
        set({
          resume: cloneResume(found.resume),
          master: cloneResume(found.resume),
          snapshot: null,
          notes: found.notes,
          templateId: found.templateId,
          density: found.density ?? "regular",
          jobDescription: found.jobDescription,
          targetCompany: found.targetCompany,
          targetRole: found.targetRole,
          letter: { ...found.letter, paragraphs: found.letter.paragraphs.slice() },
          letterTone: found.letterTone ?? "calm",
        });
        flushPersist();
        return true;
      },
      deleteVersion: (id) => {
        set((s) => ({ versions: s.versions.filter((v) => v.id !== id) }));
        flushPersist();
      },
      renameVersion: (id, name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        set((s) => ({
          versions: s.versions.map((v) => (v.id === id ? { ...v, name: trimmed } : v)),
        }));
        flushPersist();
      },
      duplicateVersion: (id) => {
        const found = get().versions.find((v) => v.id === id);
        if (!found) return null;
        const copy: SavedVersion = {
          ...found,
          id: uid(),
          name: `${found.name} copy`,
          savedAt: new Date().toISOString(),
          resume: cloneResume(found.resume),
          letter: { ...found.letter, paragraphs: found.letter.paragraphs.slice() },
        };
        set((s) => ({ versions: [copy, ...s.versions].slice(0, VERSION_CAP) }));
        flushPersist();
        return copy;
      },
      applyPack: (pack) => {
        set({
          resume: cloneResume(pack.resume),
          master: cloneResume(pack.resume),
          snapshot: null,
          notes: pack.notes,
          templateId: pack.templateId,
          density: pack.density ?? "regular",
          jobDescription: pack.jobDescription,
          targetCompany: pack.targetCompany,
          targetRole: pack.targetRole,
          letter: { ...pack.letter, paragraphs: pack.letter.paragraphs.slice() },
          letterTone: pack.letterTone ?? "calm",
        });
        flushPersist();
      },
      exportPack: () => makePack(get()),
    }),
    {
      name: "chambers-studio",
      skipHydration: true,
      storage,
      partialize: (s) => ({
        resume: s.resume,
        master: s.master,
        snapshot: s.snapshot,
        notes: s.notes,
        templateId: s.templateId,
        density: s.density,
        jobDescription: s.jobDescription,
        targetCompany: s.targetCompany,
        targetRole: s.targetRole,
        letter: s.letter,
        letterTone: s.letterTone,
        versions: s.versions,
      }),
    },
  ),
);

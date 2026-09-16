import { create } from "zustand";
import { persist, type PersistStorage, type StorageValue } from "zustand/middleware";
import { uid } from "./ids";
import { inferTargets } from "./infer";
import { emptyLetter, sampleResume } from "./sample";
import { cloneResume } from "./normalize";
import type {
  CoverLetter,
  EducationItem,
  ExperienceItem,
  ExtraSection,
  Resume,
  ResumeIdentity,
  TailorNotes,
  TemplateId,
} from "./types";

type State = {
  hydrated: boolean;
  resume: Resume;
  master: Resume;
  snapshot: Resume | null;
  notes: TailorNotes | null;
  templateId: TemplateId;
  jobDescription: string;
  targetCompany: string;
  targetRole: string;
  letter: CoverLetter;
  setHydrated: () => void;
  setResume: (resume: Resume) => void;
  patchResume: (partial: Partial<Resume>) => void;
  patchIdentity: (partial: Partial<ResumeIdentity>) => void;
  setSummary: (summary: string) => void;
  setSkills: (skills: string[]) => void;
  updateExperience: (id: string, next: ExperienceItem) => void;
  removeExperience: (id: string) => void;
  addExperience: () => void;
  moveExperience: (id: string, dir: -1 | 1) => void;
  duplicateExperience: (id: string) => void;
  replaceBullet: (jobId: string, index: number, text: string) => void;
  moveBullet: (jobId: string, index: number, dir: -1 | 1) => void;
  updateEducation: (id: string, next: EducationItem) => void;
  removeEducation: (id: string) => void;
  addEducation: () => void;
  updateExtra: (id: string, next: ExtraSection) => void;
  removeExtra: (id: string) => void;
  addExtra: () => void;
  setTemplate: (id: TemplateId) => void;
  setJobDescription: (jd: string) => void;
  setTarget: (company: string, role: string) => void;
  loadPosting: (jd: string, company: string, role: string) => void;
  setLetter: (letter: CoverLetter) => void;
  setNotes: (notes: TailorNotes | null) => void;
  saveMaster: () => void;
  restoreMaster: () => void;
  rememberSnapshot: () => void;
  undoTailor: () => void;
  resetSample: (resume: Resume) => void;
};

type Persisted = Pick<
  State,
  | "resume"
  | "master"
  | "snapshot"
  | "notes"
  | "templateId"
  | "jobDescription"
  | "targetCompany"
  | "targetRole"
  | "letter"
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

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", flushPersist);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushPersist();
  });
}

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

export const useResumeStore = create<State>()(
  persist(
    (set, get) => ({
      hydrated: false,
      resume: sampleResume(),
      master: sampleResume(),
      snapshot: null,
      notes: null,
      templateId: "letter",
      jobDescription: "",
      targetCompany: "",
      targetRole: "",
      letter: emptyLetter(),
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
      moveExperience: (id, dir) =>
        set((s) => {
          const list = s.resume.experience.slice();
          const i = list.findIndex((j) => j.id === id);
          const j = i + dir;
          if (i < 0 || j < 0 || j >= list.length) return s;
          const swap = list[i];
          list[i] = list[j];
          list[j] = swap;
          return { resume: { ...s.resume, experience: list } };
        }),
      duplicateExperience: (id) =>
        set((s) => {
          const src = s.resume.experience.find((j) => j.id === id);
          if (!src) return s;
          const copy: ExperienceItem = { ...cloneResume({ ...s.resume, experience: [src] }).experience[0], id: uid() };
          const i = s.resume.experience.findIndex((j) => j.id === id);
          const list = s.resume.experience.slice();
          list.splice(i + 1, 0, copy);
          return { resume: { ...s.resume, experience: list } };
        }),
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
      moveBullet: (jobId, index, dir) =>
        set((s) => ({
          resume: {
            ...s.resume,
            experience: s.resume.experience.map((job) => {
              if (job.id !== jobId) return job;
              const j = index + dir;
              if (j < 0 || j >= job.bullets.length) return job;
              const bullets = job.bullets.slice();
              const swap = bullets[index];
              bullets[index] = bullets[j];
              bullets[j] = swap;
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
      setTemplate: (templateId) => {
        set({ templateId });
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
        set({ jobDescription, targetCompany: company, targetRole: role });
        flushPersist();
      },
      setLetter: (letter) => {
        set({ letter });
        flushPersist();
      },
      setNotes: (notes) => {
        set({ notes });
        flushPersist();
      },
      saveMaster: () => {
        set({ master: cloneResume(get().resume) });
        flushPersist();
      },
      restoreMaster: () => set({ resume: cloneResume(get().master), notes: null }),
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
        jobDescription: s.jobDescription,
        targetCompany: s.targetCompany,
        targetRole: s.targetRole,
        letter: s.letter,
      }),
    },
  ),
);

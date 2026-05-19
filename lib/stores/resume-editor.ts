"use client";

import { create } from "zustand";
import { temporal } from "zundo";
import { produce } from "immer";
import {
  type ResumeDocument,
  type Theme,
  type TemplateId,
  type Section,
  type SectionKind,
  type Contact,
  newSection,
} from "@/lib/schemas/resume";

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

interface EditorState {
  title: string;
  templateId: TemplateId;
  theme: Theme;
  doc: ResumeDocument;
  setTitle: (s: string) => void;
  setTemplateId: (id: TemplateId) => void;
  setTheme: (patch: Partial<Theme>) => void;
  setContact: (patch: Partial<Contact>) => void;
  addLink: () => void;
  updateLink: (
    id: string,
    patch: Partial<{ label: string; url: string }>,
  ) => void;
  removeLink: (id: string) => void;
  addSection: (kind: SectionKind) => void;
  renameSection: (id: string, title: string) => void;
  removeSection: (id: string) => void;
  moveSection: (fromIdx: number, toIdx: number) => void;
  updateSummary: (sectionId: string, body: string) => void;
  updateCustom: (sectionId: string, body: string) => void;
  addItem: (sectionId: string) => void;
  updateItem: (
    sectionId: string,
    itemId: string,
    patch: Record<string, unknown>,
  ) => void;
  removeItem: (sectionId: string, itemId: string) => void;
  moveItem: (sectionId: string, fromIdx: number, toIdx: number) => void;
  addBullet: (sectionId: string, itemId: string, text?: string) => void;
  updateBullet: (
    sectionId: string,
    itemId: string,
    idx: number,
    text: string,
  ) => void;
  removeBullet: (sectionId: string, itemId: string, idx: number) => void;
  addSkillGroup: (sectionId: string) => void;
  updateSkillGroup: (
    sectionId: string,
    groupId: string,
    patch: { label?: string; skills?: string[] },
  ) => void;
  removeSkillGroup: (sectionId: string, groupId: string) => void;
  moveSkillGroup: (
    sectionId: string,
    fromIdx: number,
    toIdx: number,
  ) => void;
  hydrate: (init: {
    title: string;
    templateId: TemplateId;
    theme: Theme;
    doc: ResumeDocument;
  }) => void;
}

const findSection = (state: EditorState, id: string): Section | undefined =>
  state.doc.sections.find((s) => s.id === id);

export const useResumeEditor = create<EditorState>()(
  temporal(
    (set) => ({
      title: "",
      templateId: "minimal",
      theme: {
        accent: "#0f172a",
        fontFamily: "Helvetica",
        fontSize: 10.5,
        margin: "normal",
        lineHeight: 1.35,
      },
      doc: {
        contact: {
          fullName: "",
          headline: "",
          email: "",
          phone: "",
          location: "",
          links: [],
        },
        sections: [],
      },
      hydrate: (init) =>
        set(() => ({
          title: init.title,
          templateId: init.templateId,
          theme: init.theme,
          doc: init.doc,
        })),
      setTitle: (s) => set({ title: s }),
      setTemplateId: (id) => set({ templateId: id }),
      setTheme: (patch) =>
        set(
          produce((s: EditorState) => {
            s.theme = { ...s.theme, ...patch };
          }),
        ),
      setContact: (patch) =>
        set(
          produce((s: EditorState) => {
            s.doc.contact = { ...s.doc.contact, ...patch };
          }),
        ),
      addLink: () =>
        set(
          produce((s: EditorState) => {
            s.doc.contact.links.push({ id: newId(), label: "", url: "" });
          }),
        ),
      updateLink: (id, patch) =>
        set(
          produce((s: EditorState) => {
            const l = s.doc.contact.links.find((x) => x.id === id);
            if (l) Object.assign(l, patch);
          }),
        ),
      removeLink: (id) =>
        set(
          produce((s: EditorState) => {
            s.doc.contact.links = s.doc.contact.links.filter(
              (l) => l.id !== id,
            );
          }),
        ),
      addSection: (kind) =>
        set(
          produce((s: EditorState) => {
            s.doc.sections.push(newSection(kind));
          }),
        ),
      renameSection: (id, title) =>
        set(
          produce((s: EditorState) => {
            const sec = findSection(s, id);
            if (sec) sec.title = title;
          }),
        ),
      removeSection: (id) =>
        set(
          produce((s: EditorState) => {
            s.doc.sections = s.doc.sections.filter((x) => x.id !== id);
          }),
        ),
      moveSection: (fromIdx, toIdx) =>
        set(
          produce((s: EditorState) => {
            const [removed] = s.doc.sections.splice(fromIdx, 1);
            s.doc.sections.splice(toIdx, 0, removed);
          }),
        ),
      updateSummary: (sectionId, body) =>
        set(
          produce((s: EditorState) => {
            const sec = findSection(s, sectionId);
            if (sec && sec.kind === "summary") sec.body = body;
          }),
        ),
      updateCustom: (sectionId, body) =>
        set(
          produce((s: EditorState) => {
            const sec = findSection(s, sectionId);
            if (sec && sec.kind === "custom") sec.body = body;
          }),
        ),
      addItem: (sectionId) =>
        set(
          produce((s: EditorState) => {
            const sec = findSection(s, sectionId);
            if (!sec) return;
            const id = newId();
            switch (sec.kind) {
              case "experience":
                sec.items.push({
                  id,
                  company: "",
                  role: "",
                  location: "",
                  startDate: "",
                  endDate: "",
                  current: false,
                  bullets: [],
                });
                break;
              case "education":
                sec.items.push({
                  id,
                  school: "",
                  degree: "",
                  field: "",
                  location: "",
                  startDate: "",
                  endDate: "",
                  details: "",
                });
                break;
              case "projects":
                sec.items.push({
                  id,
                  name: "",
                  url: "",
                  description: "",
                  bullets: [],
                  tech: [],
                });
                break;
              case "certifications":
                sec.items.push({
                  id,
                  name: "",
                  issuer: "",
                  date: "",
                  url: "",
                });
                break;
              case "languages":
                sec.items.push({
                  id,
                  name: "",
                  proficiency: "Professional",
                });
                break;
            }
          }),
        ),
      updateItem: (sectionId, itemId, patch) =>
        set(
          produce((s: EditorState) => {
            const sec = findSection(s, sectionId);
            if (!sec || !("items" in sec)) return;
            const it = (sec.items as Array<{ id: string }>).find(
              (x) => x.id === itemId,
            );
            if (it) Object.assign(it, patch);
          }),
        ),
      removeItem: (sectionId, itemId) =>
        set(
          produce((s: EditorState) => {
            const sec = findSection(s, sectionId);
            if (!sec || !("items" in sec)) return;
            (sec as { items: Array<{ id: string }> }).items = (
              sec.items as Array<{ id: string }>
            ).filter((x) => x.id !== itemId);
          }),
        ),
      moveItem: (sectionId, fromIdx, toIdx) =>
        set(
          produce((s: EditorState) => {
            const sec = findSection(s, sectionId);
            if (!sec || !("items" in sec)) return;
            const items = sec.items as Array<unknown>;
            const [removed] = items.splice(fromIdx, 1);
            items.splice(toIdx, 0, removed);
          }),
        ),
      addBullet: (sectionId, itemId, text = "") =>
        set(
          produce((s: EditorState) => {
            const sec = findSection(s, sectionId);
            if (!sec) return;
            if (sec.kind === "experience" || sec.kind === "projects") {
              const it = sec.items.find((x) => x.id === itemId);
              if (it) it.bullets.push(text);
            }
          }),
        ),
      updateBullet: (sectionId, itemId, idx, text) =>
        set(
          produce((s: EditorState) => {
            const sec = findSection(s, sectionId);
            if (!sec) return;
            if (sec.kind === "experience" || sec.kind === "projects") {
              const it = sec.items.find((x) => x.id === itemId);
              if (it && idx >= 0 && idx < it.bullets.length)
                it.bullets[idx] = text;
            }
          }),
        ),
      removeBullet: (sectionId, itemId, idx) =>
        set(
          produce((s: EditorState) => {
            const sec = findSection(s, sectionId);
            if (!sec) return;
            if (sec.kind === "experience" || sec.kind === "projects") {
              const it = sec.items.find((x) => x.id === itemId);
              if (it) it.bullets.splice(idx, 1);
            }
          }),
        ),
      addSkillGroup: (sectionId) =>
        set(
          produce((s: EditorState) => {
            const sec = findSection(s, sectionId);
            if (sec && sec.kind === "skills") {
              sec.groups.push({ id: newId(), label: "", skills: [] });
            }
          }),
        ),
      updateSkillGroup: (sectionId, groupId, patch) =>
        set(
          produce((s: EditorState) => {
            const sec = findSection(s, sectionId);
            if (sec && sec.kind === "skills") {
              const g = sec.groups.find((x) => x.id === groupId);
              if (g) Object.assign(g, patch);
            }
          }),
        ),
      removeSkillGroup: (sectionId, groupId) =>
        set(
          produce((s: EditorState) => {
            const sec = findSection(s, sectionId);
            if (sec && sec.kind === "skills") {
              sec.groups = sec.groups.filter((g) => g.id !== groupId);
            }
          }),
        ),
      moveSkillGroup: (sectionId, fromIdx, toIdx) =>
        set(
          produce((s: EditorState) => {
            const sec = findSection(s, sectionId);
            if (sec && sec.kind === "skills") {
              const [removed] = sec.groups.splice(fromIdx, 1);
              sec.groups.splice(toIdx, 0, removed);
            }
          }),
        ),
    }),
    {
      // Only track doc/theme/templateId/title for undo — not the hydrate action.
      partialize: (state) => ({
        title: state.title,
        templateId: state.templateId,
        theme: state.theme,
        doc: state.doc,
      }),
      limit: 50,
      equality: (a, b) => JSON.stringify(a) === JSON.stringify(b),
    },
  ),
);

export const useEditorUndo = () => useResumeEditor.temporal.getState();

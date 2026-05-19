"use client";

import { z } from "zod";
import {
  ResumeDocumentSchema,
  TEMPLATE_IDS,
  ThemeSchema,
  defaultTheme,
  emptyDocument,
  type ResumeDocument,
  type TemplateId,
  type Theme,
} from "./schemas/resume";

export const LOCAL_RESUMES_KEY = "resume-studio:local-resumes:v1";

const TitleSchema = z.string().trim().min(1).max(120).catch("Untitled Resume");

const LocalResumeSchema = z.object({
  id: z.string().min(1).refine((value) => value.startsWith("local-")),
  title: z.string().trim().min(1).max(120).catch("Untitled Resume"),
  templateId: z.enum(TEMPLATE_IDS).catch("minimal" as TemplateId),
  theme: ThemeSchema,
  document: ResumeDocumentSchema,
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

const LocalResumeStoreSchema = z.object({
  version: z.literal(1),
  resumes: z.array(LocalResumeSchema).default([]),
});

export type LocalResume = z.infer<typeof LocalResumeSchema>;
export type LocalResumeStore = z.infer<typeof LocalResumeStoreSchema>;

function createId() {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `local-${id}`;
}

function now() {
  return new Date().toISOString();
}

function emptyStore(): LocalResumeStore {
  return { version: 1, resumes: [] };
}

function requireStorage(): Storage {
  if (typeof localStorage === "undefined") {
    throw new Error("Local storage is not available in this browser");
  }
  return localStorage;
}

export function assertLocalResumeStorageAvailable(): void {
  const storage = requireStorage();
  const probeKey = `${LOCAL_RESUMES_KEY}:probe`;
  try {
    storage.setItem(probeKey, "1");
    storage.removeItem(probeKey);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown storage error";
    throw new Error(`Local storage is not available: ${message}`);
  }
}

function readStore(): LocalResumeStore {
  let raw: string | null;
  try {
    raw = requireStorage().getItem(LOCAL_RESUMES_KEY);
  } catch {
    return emptyStore();
  }
  if (!raw) return emptyStore();

  try {
    const parsed = LocalResumeStoreSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : emptyStore();
  } catch {
    return emptyStore();
  }
}

function writeStore(store: LocalResumeStore) {
  const parsed = LocalResumeStoreSchema.parse(store);
  try {
    requireStorage().setItem(LOCAL_RESUMES_KEY, JSON.stringify(parsed));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown storage error";
    throw new Error(`Could not save local resumes: ${message}`);
  }
}

function sortByUpdatedAt(resumes: LocalResume[]) {
  return [...resumes].sort(
    (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
  );
}

export function listLocalResumes(): LocalResume[] {
  return sortByUpdatedAt(readStore().resumes);
}

export function getLocalResume(id: string): LocalResume | null {
  return readStore().resumes.find((resume) => resume.id === id) ?? null;
}

export function createLocalResume(input: {
  title: string;
  templateId: TemplateId;
}): LocalResume {
  const timestamp = now();
  const resume: LocalResume = {
    id: createId(),
    title: TitleSchema.parse(input.title),
    templateId: input.templateId,
    theme: defaultTheme(),
    document: emptyDocument(),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  const store = readStore();
  writeStore({ ...store, resumes: [resume, ...store.resumes] });
  return resume;
}

export function saveLocalResume(
  id: string,
  patch: {
    title?: string;
    templateId?: TemplateId;
    theme?: Theme;
    document?: ResumeDocument;
  },
): LocalResume {
  const store = readStore();
  const existing = store.resumes.find((resume) => resume.id === id);
  if (!existing) {
    throw new Error("Local resume not found");
  }

  const updated: LocalResume = {
    ...existing,
    title: patch.title === undefined ? existing.title : TitleSchema.parse(patch.title),
    templateId: patch.templateId ?? existing.templateId,
    theme: patch.theme ?? existing.theme,
    document: patch.document ?? existing.document,
    updatedAt: now(),
  };
  writeStore({
    ...store,
    resumes: [updated, ...store.resumes.filter((resume) => resume.id !== id)],
  });
  return updated;
}

export function duplicateLocalResume(id: string): LocalResume | null {
  const store = readStore();
  const source = store.resumes.find((resume) => resume.id === id);
  if (!source) return null;

  const timestamp = now();
  const copy: LocalResume = {
    ...source,
    id: createId(),
    title: TitleSchema.parse(`${source.title} (copy)`),
    document: ResumeDocumentSchema.parse(source.document),
    theme: ThemeSchema.parse(source.theme),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  writeStore({ ...store, resumes: [copy, ...store.resumes] });
  return copy;
}

export function deleteLocalResume(id: string): void {
  const store = readStore();
  writeStore({
    ...store,
    resumes: store.resumes.filter((resume) => resume.id !== id),
  });
}

export function renameLocalResume(
  id: string,
  title: string,
): LocalResume | null {
  try {
    return saveLocalResume(id, { title });
  } catch (err) {
    if (err instanceof Error && err.message === "Local resume not found") {
      return null;
    }
    throw err;
  }
}

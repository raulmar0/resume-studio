"use client";

import { saveLocalResume } from "../local-resumes";
import type {
  ResumeDocument,
  TemplateId,
  Theme,
} from "../schemas/resume";

export type PersistenceMode = "cloud" | "local";

export interface AutosavePayload {
  mode: PersistenceMode;
  resumeId: string;
  document: ResumeDocument;
  theme: Theme;
  templateId: TemplateId;
  saveCloud?: (
    id: string,
    payload: {
      document: ResumeDocument;
      theme: Theme;
      templateId: TemplateId;
    },
  ) => Promise<void>;
}

export async function persistAutosave({
  mode,
  resumeId,
  document,
  theme,
  templateId,
  saveCloud,
}: AutosavePayload): Promise<void> {
  if (mode === "local") {
    saveLocalResume(resumeId, { document, theme, templateId });
    return;
  }

  if (!saveCloud) {
    throw new Error("Cloud autosave is not configured");
  }
  await saveCloud(resumeId, { document, theme, templateId });
}

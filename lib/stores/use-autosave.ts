"use client";

import { useEffect, useRef, useState } from "react";
import { saveResume } from "@/app/resumes/actions";
import { useResumeEditor } from "@/lib/stores/resume-editor";
import { shouldApplyAutosaveResult } from "./autosave-version";
import {
  persistAutosave,
  type PersistenceMode,
} from "./autosave-persistence";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

const DEBOUNCE_MS = 800;
const SAVED_COOLDOWN_MS = 1500;

export function useAutosave(
  resumeId: string,
  mode: PersistenceMode = "cloud",
): SaveStatus {
  const doc = useResumeEditor((s) => s.doc);
  const theme = useResumeEditor((s) => s.theme);
  const templateId = useResumeEditor((s) => s.templateId);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const skipFirst = useRef(true);
  const changeVersion = useRef(0);
  const savedAt = useRef(0);

  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }
    const version = ++changeVersion.current;
    if (Date.now() - savedAt.current >= SAVED_COOLDOWN_MS) {
      setStatus("saving");
    }

    const timer = setTimeout(async () => {
      try {
        await persistAutosave({
          mode,
          resumeId,
          document: doc,
          theme,
          templateId,
          saveCloud: saveResume,
        });
        if (shouldApplyAutosaveResult(version, changeVersion.current)) {
          setStatus("saved");
          savedAt.current = Date.now();
        }
      } catch {
        if (shouldApplyAutosaveResult(version, changeVersion.current)) {
          setStatus("error");
        }
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [doc, theme, templateId, resumeId, mode]);

  return status;
}

"use client";

import { useEffect, useRef, useState } from "react";
import { saveResume } from "@/app/resumes/actions";
import { useResumeEditor } from "@/lib/stores/resume-editor";
import { shouldApplyAutosaveResult } from "./autosave-version";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

const DEBOUNCE_MS = 800;

export function useAutosave(resumeId: string): SaveStatus {
  const doc = useResumeEditor((s) => s.doc);
  const theme = useResumeEditor((s) => s.theme);
  const templateId = useResumeEditor((s) => s.templateId);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const skipFirst = useRef(true);
  const changeVersion = useRef(0);

  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }
    const version = ++changeVersion.current;
    setStatus("saving");

    const timer = setTimeout(async () => {
      try {
        await saveResume(resumeId, {
          document: doc,
          theme,
          templateId,
        });
        if (shouldApplyAutosaveResult(version, changeVersion.current)) {
          setStatus("saved");
        }
      } catch {
        if (shouldApplyAutosaveResult(version, changeVersion.current)) {
          setStatus("error");
        }
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [doc, theme, templateId, resumeId]);

  return status;
}

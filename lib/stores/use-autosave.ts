"use client";

import { useEffect, useRef, useState } from "react";
import { saveResume } from "@/app/resumes/actions";
import { useResumeEditor } from "@/lib/stores/resume-editor";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

const DEBOUNCE_MS = 800;

export function useAutosave(resumeId: string): SaveStatus {
  const doc = useResumeEditor((s) => s.doc);
  const theme = useResumeEditor((s) => s.theme);
  const templateId = useResumeEditor((s) => s.templateId);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const skipFirst = useRef(true);

  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setStatus("saving");
        await saveResume(resumeId, {
          document: doc,
          theme,
          templateId,
        });
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [doc, theme, templateId, resumeId]);

  return status;
}

"use client";

import { useEffect } from "react";
import { useResumeEditor } from "@/lib/stores/resume-editor";
import { useAutosave } from "@/lib/stores/use-autosave";
import type {
  ResumeDocument,
  Theme,
  TemplateId,
} from "@/lib/schemas/resume";
import type { PersistenceMode } from "@/lib/stores/autosave-persistence";
import { Toolbar } from "./Toolbar";
import { SectionPanel } from "./SectionPanel";
import { LivePreview } from "@/components/preview/LivePreview";

export interface EditorInit {
  id: string;
  title: string;
  templateId: TemplateId;
  theme: Theme;
  doc: ResumeDocument;
  mode?: PersistenceMode;
}

export function Editor({ init }: { init: EditorInit }) {
  const hydrate = useResumeEditor((s) => s.hydrate);

  useEffect(() => {
    hydrate({
      title: init.title,
      templateId: init.templateId,
      theme: init.theme,
      doc: init.doc,
    });
    useResumeEditor.temporal.getState().clear();
  }, [init.id, init.title, init.templateId, init.theme, init.doc, hydrate]);

  const mode = init.mode ?? "cloud";
  const status = useAutosave(init.id, mode);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      if (e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        useResumeEditor.temporal.getState().undo();
      } else if ((e.key === "z" && e.shiftKey) || e.key === "y") {
        e.preventDefault();
        useResumeEditor.temporal.getState().redo();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="h-svh flex flex-col">
      <Toolbar resumeId={init.id} status={status} mode={mode} />
      <div className="min-h-0 flex-1 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] overflow-hidden">
        <div className="min-h-0 overflow-y-auto border-r bg-muted/20">
          <SectionPanel />
        </div>
        <div className="hidden min-h-0 overflow-hidden lg:block">
          <LivePreview />
        </div>
      </div>
    </div>
  );
}

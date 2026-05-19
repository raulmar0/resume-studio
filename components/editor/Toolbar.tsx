"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  CloudOff,
  Download,
  FileDown,
  FileUp,
  Loader2,
  Palette,
  Redo2,
  Save,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useResumeEditor, useEditorUndo } from "@/lib/stores/resume-editor";
import { type SaveStatus } from "@/lib/stores/use-autosave";
import { TEMPLATES } from "@/lib/templates/registry";
import { renameResume } from "@/app/resumes/actions";
import {
  buildResumeFilename,
  downloadResumePdf,
} from "@/lib/pdf/export";
import { getTemplateComponent } from "@/lib/templates/components";
import { createElement } from "react";
import type { TemplateId } from "@/lib/schemas/resume";
import {
  buildResumeImportTemplate,
  exportResumeData,
  inferResumeTransferFormat,
  parseResumeImport,
  type ResumeTransferFormat,
} from "@/lib/resume-transfer";
import { ThemePanel } from "./ThemePanel";

export function Toolbar({
  resumeId,
  status,
}: {
  resumeId: string;
  status: SaveStatus;
}) {
  const title = useResumeEditor((s) => s.title);
  const setTitle = useResumeEditor((s) => s.setTitle);
  const templateId = useResumeEditor((s) => s.templateId);
  const setTemplateId = useResumeEditor((s) => s.setTemplateId);
  const doc = useResumeEditor((s) => s.doc);
  const theme = useResumeEditor((s) => s.theme);
  const hydrate = useResumeEditor((s) => s.hydrate);

  const [draftTitle, setDraftTitle] = useState(title);
  const [, startTransition] = useTransition();
  const [downloading, setDownloading] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const undo = useEditorUndo();
  const canUndo = undo.pastStates.length > 0;
  const canRedo = undo.futureStates.length > 0;

  function commitTitle(next: string) {
    const trimmed = next.trim() || "Untitled Resume";
    if (trimmed === title) return;
    setDraftTitle(trimmed);
    setTitle(trimmed);
    startTransition(async () => {
      try {
        await renameResume(resumeId, trimmed);
      } catch (err) {
        toast.error("Could not save title", {
          description: err instanceof Error ? err.message : undefined,
        });
      }
    });
  }

  async function onDownload() {
    setDownloading(true);
    try {
      const Template = getTemplateComponent(templateId);
      await downloadResumePdf({
        document: createElement(Template, { doc, theme }),
        filename: buildResumeFilename(title || "resume"),
      });
    } catch (err) {
      toast.error("Could not generate PDF", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setDownloading(false);
    }
  }

  function downloadText(filename: string, content: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function exportData(format: ResumeTransferFormat) {
    const extension = format === "json" ? "json" : "yaml";
    downloadText(
      buildResumeFilename(title || "resume").replace(/\.pdf$/i, `.${extension}`),
      exportResumeData({ title, templateId, theme, document: doc }, format),
      format === "json" ? "application/json" : "application/yaml",
    );
  }

  function downloadImportTemplate() {
    downloadText(
      "resume-import-template.yaml",
      buildResumeImportTemplate("yaml"),
      "application/yaml",
    );
  }

  async function importFile(file: File) {
    try {
      const parsed = parseResumeImport(
        await file.text(),
        inferResumeTransferFormat(file.name),
      );
      hydrate({
        title: parsed.title,
        templateId: parsed.templateId,
        theme: parsed.theme,
        doc: parsed.document,
      });
      setDraftTitle(parsed.title);
      startTransition(async () => {
        try {
          await renameResume(resumeId, parsed.title);
        } catch (err) {
          toast.error("Imported locally, but title was not saved", {
            description: err instanceof Error ? err.message : undefined,
          });
        }
      });
      setImportOpen(false);
      toast.success("Resume imported");
    } catch (err) {
      toast.error("Could not import resume", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="h-14 border-b bg-background/80 backdrop-blur sticky top-0 z-20 flex items-center px-3 gap-2">
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              render={<Link href="/dashboard" aria-label="Back to dashboard" />}
            />
          }
        >
          <ArrowLeft className="size-4" />
        </TooltipTrigger>
        <TooltipContent>Dashboard</TooltipContent>
      </Tooltip>

      <Input
        value={draftTitle}
        onChange={(e) => setDraftTitle(e.target.value)}
        onBlur={(e) => commitTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            (e.target as HTMLInputElement).blur();
          }
        }}
        placeholder="Untitled Resume"
        className="max-w-xs h-9 font-medium border-transparent hover:border-input focus-visible:border-input"
      />

      <div className="ml-2 hidden md:flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                onClick={() => undo.undo()}
                disabled={!canUndo}
                aria-label="Undo"
              />
            }
          >
            <Undo2 className="size-4" />
          </TooltipTrigger>
          <TooltipContent>Undo (⌘Z)</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                onClick={() => undo.redo()}
                disabled={!canRedo}
                aria-label="Redo"
              />
            }
          >
            <Redo2 className="size-4" />
          </TooltipTrigger>
          <TooltipContent>Redo (⌘⇧Z)</TooltipContent>
        </Tooltip>
      </div>

      <div className="flex-1" />

      <Select
        value={templateId}
        onValueChange={(v) => setTemplateId(v as TemplateId)}
      >
        <SelectTrigger size="sm" className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TEMPLATES.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger render={<Button variant="outline" size="sm" />}>
          <Palette className="size-4" />
          Theme
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72">
          <ThemePanel />
        </PopoverContent>
      </Popover>

      <SaveStatusPill status={status} />

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
          <FileUp className="size-4" />
          Import
        </Button>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import resume data</DialogTitle>
            <DialogDescription>
              Continue with a JSON or YAML file, or download the template first.
            </DialogDescription>
          </DialogHeader>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.yaml,.yml,application/json,application/yaml,text/yaml"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void importFile(file);
            }}
          />
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button variant="outline" onClick={downloadImportTemplate}>
              <FileDown className="size-4" />
              Download template
            </Button>
            <Button onClick={() => fileInputRef.current?.click()}>
              <FileUp className="size-4" />
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button variant="outline" onClick={() => exportData("json")} size="sm">
        <FileDown className="size-4" />
        JSON
      </Button>

      <Button variant="outline" onClick={() => exportData("yaml")} size="sm">
        <FileDown className="size-4" />
        YAML
      </Button>

      <Button onClick={onDownload} disabled={downloading} size="sm">
        {downloading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Download className="size-4" />
        )}
        {downloading ? "Generating…" : "Download PDF"}
      </Button>
    </div>
  );
}

function SaveStatusPill({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;
  const map: Record<
    Exclude<SaveStatus, "idle">,
    { icon: React.ReactNode; text: string; cls: string }
  > = {
    saving: {
      icon: <Save className="size-3.5" />,
      text: "Saving…",
      cls: "text-muted-foreground",
    },
    saved: {
      icon: <Check className="size-3.5" />,
      text: "Saved",
      cls: "text-muted-foreground",
    },
    error: {
      icon: <CloudOff className="size-3.5" />,
      text: "Offline",
      cls: "text-destructive",
    },
  };
  const m = map[status];
  return (
    <div className={`flex items-center gap-1.5 text-xs ${m.cls} mr-1`}>
      {m.icon}
      <span>{m.text}</span>
    </div>
  );
}

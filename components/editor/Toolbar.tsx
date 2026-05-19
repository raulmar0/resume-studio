"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ChevronDown,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useResumeEditor, useEditorUndo } from "@/lib/stores/resume-editor";
import { type SaveStatus } from "@/lib/stores/use-autosave";
import type { PersistenceMode } from "@/lib/stores/autosave-persistence";
import { TEMPLATES } from "@/lib/templates/registry";
import { renameResume } from "@/app/resumes/actions";
import { renameLocalResume, saveLocalResume } from "@/lib/local-resumes";
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
  mode = "cloud",
}: {
  resumeId: string;
  status: SaveStatus;
  mode?: PersistenceMode;
}) {
  const title = useResumeEditor((s) => s.title);
  const setTitle = useResumeEditor((s) => s.setTitle);
  const templateId = useResumeEditor((s) => s.templateId);
  const setTemplateId = useResumeEditor((s) => s.setTemplateId);
  const doc = useResumeEditor((s) => s.doc);
  const theme = useResumeEditor((s) => s.theme);
  const hydrate = useResumeEditor((s) => s.hydrate);

  const [, startTransition] = useTransition();
  const [downloading, setDownloading] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const undo = useEditorUndo();
  const canUndo = undo.pastStates.length > 0;
  const canRedo = undo.futureStates.length > 0;
  const dashboardHref = mode === "local" ? "/guest/dashboard" : "/dashboard";

  function commitTitle(next: string) {
    const trimmed = next.trim() || "Untitled Resume";
    if (trimmed === title) return;
    setTitle(trimmed);
    if (mode === "local") {
      try {
        renameLocalResume(resumeId, trimmed);
      } catch (err) {
        toast.error("Could not save title", {
          description: err instanceof Error ? err.message : undefined,
        });
      }
      return;
    }
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

  function downloadImportTemplate(format: ResumeTransferFormat) {
    const extension = format === "json" ? "json" : "yaml";
    downloadText(
      `resume-import-template.${extension}`,
      buildResumeImportTemplate(format),
      format === "json" ? "application/json" : "application/yaml",
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
      if (mode === "local") {
        saveLocalResume(resumeId, {
          title: parsed.title,
          templateId: parsed.templateId,
          theme: parsed.theme,
          document: parsed.document,
        });
        setImportOpen(false);
        toast.success("Resume imported");
        return;
      }
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
              render={<Link href={dashboardHref} aria-label="Back to dashboard" />}
            />
          }
        >
          <ArrowLeft className="size-4" />
        </TooltipTrigger>
        <TooltipContent>Dashboard</TooltipContent>
      </Tooltip>

      <TitleInput key={title} title={title} onCommit={commitTitle} />

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
              Upload a JSON or YAML file. Supports full exports, document-only
              data, and JSON Resume format.
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
          <div className="flex flex-col gap-2 text-xs text-muted-foreground">
            <span>Need a starting point?</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadImportTemplate("json")}
              >
                <FileDown className="size-4" />
                JSON template
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadImportTemplate("yaml")}
              >
                <FileDown className="size-4" />
                YAML template
              </Button>
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button onClick={() => fileInputRef.current?.click()}>
              <FileUp className="size-4" />
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="outline" size="sm">
              <FileDown className="size-4" />
              Export
              <ChevronDown className="size-3 opacity-50" />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => exportData("json")}>
            Export as JSON
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => exportData("yaml")}>
            Export as YAML
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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

function TitleInput({
  title,
  onCommit,
}: {
  title: string;
  onCommit: (next: string) => void;
}) {
  const [draftTitle, setDraftTitle] = useState(title);

  return (
    <Input
      value={draftTitle}
      onChange={(e) => setDraftTitle(e.target.value)}
      onBlur={(e) => {
        const trimmed = e.target.value.trim() || "Untitled Resume";
        setDraftTitle(trimmed);
        onCommit(trimmed);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          (e.target as HTMLInputElement).blur();
        }
      }}
      placeholder="Untitled Resume"
      className="h-9 max-w-xs border-transparent font-medium hover:border-input focus-visible:border-input"
    />
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
    <div
      className={`mr-1 flex w-[76px] shrink-0 items-center gap-1.5 text-xs ${m.cls}`}
      aria-live="polite"
    >
      <span className="grid size-3.5 place-items-center">{m.icon}</span>
      <span>{m.text}</span>
    </div>
  );
}

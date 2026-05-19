"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Copy,
  FileText,
  MoreHorizontal,
  PencilLine,
  Plus,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  assertLocalResumeStorageAvailable,
  createLocalResume,
  deleteLocalResume,
  duplicateLocalResume,
  listLocalResumes,
  renameLocalResume,
  type LocalResume,
} from "@/lib/local-resumes";
import { TEMPLATES, getTemplate } from "@/lib/templates/registry";
import type { TemplateId } from "@/lib/schemas/resume";
import { GuestNavBar } from "./GuestNavBar";

export function GuestDashboard() {
  const [resumes, setResumes] = useState<LocalResume[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  function refresh() {
    try {
      assertLocalResumeStorageAvailable();
      setResumes(listLocalResumes());
      setStorageError(null);
    } catch (err) {
      setStorageError(err instanceof Error ? err.message : "Storage failed");
    } finally {
      setLoaded(true);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(refresh, 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-svh flex-col">
      <GuestNavBar />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Your resumes
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Stored on this browser. Export JSON or YAML before clearing site
                data or switching devices.
              </p>
            </div>
            <GuestNewResumeDialog onCreated={refresh} />
          </div>

          {storageError ? (
            <StorageError message={storageError} />
          ) : !loaded ? (
            <DashboardSkeleton />
          ) : resumes.length === 0 ? (
            <EmptyState onCreated={refresh} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {resumes.map((resume) => (
                <GuestResumeCard
                  key={resume.id}
                  resume={resume}
                  onChanged={refresh}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StorageError({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-destructive/40 p-8">
      <h2 className="text-lg font-medium">Browser storage is unavailable</h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Guest mode needs localStorage to save resumes on this browser. Enable
        site storage or sign in to use cloud storage.
      </p>
      <p className="mt-3 text-xs text-destructive">{message}</p>
      <Button className="mt-6" render={<Link href="/login" />}>
        Sign in
      </Button>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, idx) => (
        <Skeleton key={idx} className="h-40 rounded-lg" />
      ))}
    </div>
  );
}

function EmptyState({ onCreated }: { onCreated: () => void }) {
  return (
    <div className="rounded-lg border border-dashed p-16 text-center">
      <div className="mx-auto grid size-12 place-items-center rounded-md bg-muted">
        <FileText className="size-5 text-muted-foreground" />
      </div>
      <h2 className="mt-4 text-lg font-medium">No local resumes yet</h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        Create a guest resume to edit locally. It stays on this browser until
        you delete it or clear site data.
      </p>
      <div className="mt-6 inline-block">
        <GuestNewResumeDialog onCreated={onCreated} />
      </div>
    </div>
  );
}

function GuestNewResumeDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [templateId, setTemplateId] = useState<TemplateId>("minimal");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function onSubmit(formData: FormData) {
    const title = ((formData.get("title") as string | null) ?? "").trim();
    startTransition(() => {
      try {
        const resume = createLocalResume({
          title: title || "Untitled Resume",
          templateId,
        });
        setOpen(false);
        onCreated();
        router.push(`/guest/editor/${resume.id}`);
      } catch (err) {
        toast.error("Could not create local resume", {
          description: err instanceof Error ? err.message : undefined,
        });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" />
        New resume
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New local resume</DialogTitle>
          <DialogDescription>
            Pick a starting template. You can switch templates anytime in the
            editor.
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="guest-title">Title</Label>
            <Input
              id="guest-title"
              name="title"
              placeholder="e.g. Backend Engineer - Stripe"
              autoFocus
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Template</Label>
            <div className="grid grid-cols-3 gap-2">
              {TEMPLATES.map((tpl) => (
                <button
                  type="button"
                  key={tpl.id}
                  onClick={() => setTemplateId(tpl.id)}
                  className={cn(
                    "rounded-md border p-3 text-left transition-colors",
                    templateId === tpl.id
                      ? "border-foreground bg-muted"
                      : "hover:bg-muted/50",
                  )}
                >
                  <div className="text-sm font-medium">{tpl.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {tpl.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Creating..." : "Create resume"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function GuestResumeCard({
  resume,
  onChanged,
}: {
  resume: LocalResume;
  onChanged: () => void;
}) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const template = getTemplate(resume.templateId);
  const updatedRelative = formatDistanceToNow(new Date(resume.updatedAt), {
    addSuffix: true,
  });

  function onDuplicate() {
    startTransition(() => {
      try {
        duplicateLocalResume(resume.id);
        toast.success("Resume duplicated");
        onChanged();
      } catch (err) {
        toast.error("Could not duplicate", {
          description: err instanceof Error ? err.message : undefined,
        });
      }
    });
  }

  function onDelete() {
    startTransition(() => {
      try {
        deleteLocalResume(resume.id);
        toast.success("Resume deleted");
        setDeleteOpen(false);
        onChanged();
      } catch (err) {
        toast.error("Could not delete", {
          description: err instanceof Error ? err.message : undefined,
        });
      }
    });
  }

  function onRename(formData: FormData) {
    const title = (formData.get("title") as string) ?? "";
    startTransition(() => {
      try {
        renameLocalResume(resume.id, title);
        toast.success("Renamed");
        setRenameOpen(false);
        onChanged();
      } catch (err) {
        toast.error("Could not rename", {
          description: err instanceof Error ? err.message : undefined,
        });
      }
    });
  }

  return (
    <div className="group flex flex-col rounded-lg border bg-card transition hover:shadow-sm">
      <Link
        href={`/guest/editor/${resume.id}`}
        className="grid flex-1 place-items-center rounded-t-lg bg-muted/30 p-6"
      >
        <div className="grid size-12 place-items-center rounded-md border bg-background">
          <FileText className="size-5 text-muted-foreground" />
        </div>
      </Link>
      <div className="flex items-start justify-between gap-2 p-4">
        <div className="min-w-0">
          <Link href={`/guest/editor/${resume.id}`} className="block min-w-0">
            <h3 className="truncate font-medium">{resume.title}</h3>
          </Link>
          <p className="mt-1 text-xs text-muted-foreground">
            {template.name} · Updated {updatedRelative}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="-mr-1 size-8" />
            }
          >
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Actions</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setRenameOpen(true)}>
              <PencilLine className="size-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onDuplicate} disabled={pending}>
              <Copy className="size-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => setDeleteOpen(true)}
            >
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename resume</DialogTitle>
          </DialogHeader>
          <form action={onRename} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`title-${resume.id}`}>Title</Label>
              <Input
                id={`title-${resume.id}`}
                name="title"
                defaultValue={resume.title}
                autoFocus
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setRenameOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this resume?</AlertDialogTitle>
            <AlertDialogDescription>
              {resume.title} will be permanently removed from this browser. This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              disabled={pending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

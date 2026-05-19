"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Copy,
  MoreHorizontal,
  PencilLine,
  Trash2,
  FileText,
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { getTemplate } from "@/lib/templates/registry";
import {
  deleteResume,
  duplicateResume,
  renameResume,
} from "@/app/resumes/actions";

export interface ResumeCardProps {
  id: string;
  title: string;
  templateId: string;
  updatedAt: string;
}

export function ResumeCard({
  id,
  title,
  templateId,
  updatedAt,
}: ResumeCardProps) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const template = getTemplate(templateId);
  const updatedRelative = formatDistanceToNow(new Date(updatedAt), {
    addSuffix: true,
  });

  function onDuplicate() {
    startTransition(async () => {
      try {
        await duplicateResume(id);
        toast.success("Resume duplicated");
        router.refresh();
      } catch (err) {
        toast.error("Could not duplicate", {
          description: err instanceof Error ? err.message : undefined,
        });
      }
    });
  }

  function onDelete() {
    startTransition(async () => {
      try {
        await deleteResume(id);
        toast.success("Resume deleted");
        setDeleteOpen(false);
        router.refresh();
      } catch (err) {
        toast.error("Could not delete", {
          description: err instanceof Error ? err.message : undefined,
        });
      }
    });
  }

  function onRename(formData: FormData) {
    const title = (formData.get("title") as string) ?? "";
    startTransition(async () => {
      try {
        await renameResume(id, title);
        toast.success("Renamed");
        setRenameOpen(false);
        router.refresh();
      } catch (err) {
        toast.error("Could not rename", {
          description: err instanceof Error ? err.message : undefined,
        });
      }
    });
  }

  return (
    <div className="group rounded-lg border bg-card hover:shadow-sm transition flex flex-col">
      <Link
        href={`/editor/${id}`}
        className="flex-1 p-6 grid place-items-center bg-muted/30 rounded-t-lg"
      >
        <div className="size-12 grid place-items-center rounded-md bg-background border">
          <FileText className="size-5 text-muted-foreground" />
        </div>
      </Link>
      <div className="p-4 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link href={`/editor/${id}`} className="block min-w-0">
            <h3 className="font-medium truncate">{title}</h3>
          </Link>
          <p className="text-xs text-muted-foreground mt-1">
            {template.name} · Updated {updatedRelative}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="size-8 -mr-1" />
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
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                defaultValue={title}
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
              {title} will be permanently removed. This cannot be undone.
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

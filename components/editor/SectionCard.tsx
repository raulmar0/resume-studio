"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useResumeEditor } from "@/lib/stores/resume-editor";
import { SectionBody } from "./SectionBody";

export function SectionCard({ sectionId }: { sectionId: string }) {
  const section = useResumeEditor((s) =>
    s.doc.sections.find((x) => x.id === sectionId),
  );
  const renameSection = useResumeEditor((s) => s.renameSection);
  const removeSection = useResumeEditor((s) => s.removeSection);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: sectionId });
  const [confirmRemove, setConfirmRemove] = useState(false);

  if (!section) return null;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg border bg-card overflow-hidden"
    >
      <div className="flex items-center gap-1 p-2 border-b bg-muted/20">
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground"
          aria-label="Reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
        <Input
          value={section.title}
          onChange={(e) => renameSection(section.id, e.target.value)}
          className="border-transparent focus-visible:border-input h-8 font-medium"
        />
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon" className="size-8" />}
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => setConfirmRemove(true)}
            >
              <Trash2 className="size-4" />
              Remove section
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="p-4 sm:p-5">
        <SectionBody sectionId={section.id} />
      </div>

      <AlertDialog open={confirmRemove} onOpenChange={setConfirmRemove}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this section?</AlertDialogTitle>
            <AlertDialogDescription>
              {section.title} and all its content will be removed from this
              resume.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removeSection(section.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

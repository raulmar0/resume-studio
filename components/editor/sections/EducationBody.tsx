"use client";

import { Plus, Trash2, GripVertical } from "lucide-react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useResumeEditor } from "@/lib/stores/resume-editor";

export function EducationBody({ sectionId }: { sectionId: string }) {
  const section = useResumeEditor((s) =>
    s.doc.sections.find((x) => x.id === sectionId),
  );
  const addItem = useResumeEditor((s) => s.addItem);
  const moveItem = useResumeEditor((s) => s.moveItem);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  if (!section || section.kind !== "education") return null;

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !section || section.kind !== "education") return;
    const oldIdx = section.items.findIndex((i) => i.id === active.id);
    const newIdx = section.items.findIndex((i) => i.id === over.id);
    if (oldIdx >= 0 && newIdx >= 0) moveItem(section.id, oldIdx, newIdx);
  }

  return (
    <div className="space-y-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext
          items={section.items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {section.items.map((item) => (
            <EduItemEditor
              key={item.id}
              sectionId={section.id}
              itemId={item.id}
            />
          ))}
        </SortableContext>
      </DndContext>
      <Button
        variant="outline"
        size="sm"
        onClick={() => addItem(section.id)}
        className="w-full"
      >
        <Plus className="size-4" />
        Add education
      </Button>
    </div>
  );
}

function EduItemEditor({
  sectionId,
  itemId,
}: {
  sectionId: string;
  itemId: string;
}) {
  const item = useResumeEditor((s) => {
    const sec = s.doc.sections.find((x) => x.id === sectionId);
    if (!sec || sec.kind !== "education") return null;
    return sec.items.find((i) => i.id === itemId) ?? null;
  });
  const updateItem = useResumeEditor((s) => s.updateItem);
  const removeItem = useResumeEditor((s) => s.removeItem);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: itemId });
  if (!item) return null;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="rounded-md border bg-background">
      <div className="flex items-center gap-1 px-2 py-1 border-b bg-muted/20">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground"
          aria-label="Reorder"
        >
          <GripVertical className="size-4" />
        </button>
        <span className="text-xs text-muted-foreground flex-1 truncate">
          {item.school || item.degree || "New education"}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => removeItem(sectionId, itemId)}
          aria-label="Remove"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
      <div className="p-3 grid sm:grid-cols-2 gap-3">
        <Field label="School">
          <Input
            value={item.school}
            onChange={(e) => updateItem(sectionId, itemId, { school: e.target.value })}
            placeholder="Tecnológico de Monterrey"
          />
        </Field>
        <Field label="Location">
          <Input
            value={item.location}
            onChange={(e) => updateItem(sectionId, itemId, { location: e.target.value })}
            placeholder="Monterrey, MX"
          />
        </Field>
        <Field label="Degree">
          <Input
            value={item.degree}
            onChange={(e) => updateItem(sectionId, itemId, { degree: e.target.value })}
            placeholder="B.S."
          />
        </Field>
        <Field label="Field of study">
          <Input
            value={item.field}
            onChange={(e) => updateItem(sectionId, itemId, { field: e.target.value })}
            placeholder="Computer Science"
          />
        </Field>
        <div className="grid grid-cols-2 gap-2 sm:col-span-2">
          <Field label="Start">
            <Input
              value={item.startDate}
              onChange={(e) =>
                updateItem(sectionId, itemId, { startDate: e.target.value })
              }
              placeholder="2018"
            />
          </Field>
          <Field label="End">
            <Input
              value={item.endDate}
              onChange={(e) => updateItem(sectionId, itemId, { endDate: e.target.value })}
              placeholder="2022"
            />
          </Field>
        </div>
        <div className="sm:col-span-2 space-y-1.5">
          <Label className="text-xs">Details (optional)</Label>
          <Textarea
            value={item.details}
            onChange={(e) => updateItem(sectionId, itemId, { details: e.target.value })}
            placeholder="GPA, honors, relevant coursework…"
            rows={2}
            className="resize-none"
          />
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

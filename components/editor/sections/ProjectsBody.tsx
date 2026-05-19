"use client";

import { KeyboardEvent, useState } from "react";
import { Plus, Trash2, X, GripVertical } from "lucide-react";
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

export function ProjectsBody({ sectionId }: { sectionId: string }) {
  const section = useResumeEditor((s) =>
    s.doc.sections.find((x) => x.id === sectionId),
  );
  const addItem = useResumeEditor((s) => s.addItem);
  const moveItem = useResumeEditor((s) => s.moveItem);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  if (!section || section.kind !== "projects") return null;

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !section || section.kind !== "projects") return;
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
            <ProjectItemEditor
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
        Add project
      </Button>
    </div>
  );
}

function ProjectItemEditor({
  sectionId,
  itemId,
}: {
  sectionId: string;
  itemId: string;
}) {
  const item = useResumeEditor((s) => {
    const sec = s.doc.sections.find((x) => x.id === sectionId);
    if (!sec || sec.kind !== "projects") return null;
    return sec.items.find((i) => i.id === itemId) ?? null;
  });
  const updateItem = useResumeEditor((s) => s.updateItem);
  const removeItem = useResumeEditor((s) => s.removeItem);
  const addBullet = useResumeEditor((s) => s.addBullet);
  const updateBullet = useResumeEditor((s) => s.updateBullet);
  const removeBullet = useResumeEditor((s) => s.removeBullet);

  const [techDraft, setTechDraft] = useState("");
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: itemId });
  if (!item) return null;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  function commitTech() {
    const v = techDraft.trim();
    if (!item || !v || item.tech.includes(v)) {
      setTechDraft("");
      return;
    }
    updateItem(sectionId, itemId, { tech: [...item.tech, v] });
    setTechDraft("");
  }

  function onTechKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitTech();
    } else if (e.key === "Backspace" && techDraft === "" && item && item.tech.length > 0) {
      updateItem(sectionId, itemId, { tech: item.tech.slice(0, -1) });
    }
  }

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
          {item.name || "New project"}
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
      <div className="p-3 space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Name">
            <Input
              value={item.name}
              onChange={(e) => updateItem(sectionId, itemId, { name: e.target.value })}
              placeholder="Open-source CLI"
            />
          </Field>
          <Field label="URL">
            <Input
              value={item.url}
              onChange={(e) => updateItem(sectionId, itemId, { url: e.target.value })}
              placeholder="https://github.com/…"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description">
              <Textarea
                value={item.description}
                onChange={(e) =>
                  updateItem(sectionId, itemId, { description: e.target.value })
                }
                placeholder="One-line description of the project."
                rows={2}
                className="resize-none"
              />
            </Field>
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <Label className="text-xs">Tech</Label>
            <div className="flex flex-wrap gap-1.5">
              {item.tech.map((t, i) => (
                <span
                  key={`${t}-${i}`}
                  className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() =>
                      updateItem(sectionId, itemId, {
                        tech: item.tech.filter((_, idx) => idx !== i),
                      })
                    }
                    aria-label={`Remove ${t}`}
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
            <Input
              value={techDraft}
              onChange={(e) => setTechDraft(e.target.value)}
              onKeyDown={onTechKey}
              onBlur={commitTech}
              placeholder="Add tech and press Enter"
              className="h-8 mt-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Highlights</Label>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => addBullet(sectionId, itemId)}
              className="h-7 text-xs"
            >
              <Plus className="size-3.5" />
              Add bullet
            </Button>
          </div>
          <div className="space-y-2">
            {item.bullets.map((b, i) => (
              <div key={i} className="flex gap-2 items-start">
                <Textarea
                  value={b}
                  onChange={(e) => updateBullet(sectionId, itemId, i, e.target.value)}
                  placeholder="What problem it solved or what you learned."
                  rows={2}
                  className="resize-none"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeBullet(sectionId, itemId, i)}
                  aria-label="Remove bullet"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
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

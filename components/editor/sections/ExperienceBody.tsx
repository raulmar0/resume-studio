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

export function ExperienceBody({ sectionId }: { sectionId: string }) {
  const section = useResumeEditor((s) =>
    s.doc.sections.find((x) => x.id === sectionId),
  );
  const addItem = useResumeEditor((s) => s.addItem);
  const moveItem = useResumeEditor((s) => s.moveItem);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  if (!section || section.kind !== "experience") return null;

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !section || section.kind !== "experience") return;
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
            <ExperienceItemEditor
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
        Add role
      </Button>
    </div>
  );
}

function ExperienceItemEditor({
  sectionId,
  itemId,
}: {
  sectionId: string;
  itemId: string;
}) {
  const item = useResumeEditor((s) => {
    const sec = s.doc.sections.find((x) => x.id === sectionId);
    if (!sec || sec.kind !== "experience") return null;
    return sec.items.find((i) => i.id === itemId) ?? null;
  });
  const updateItem = useResumeEditor((s) => s.updateItem);
  const removeItem = useResumeEditor((s) => s.removeItem);
  const addBullet = useResumeEditor((s) => s.addBullet);
  const updateBullet = useResumeEditor((s) => s.updateBullet);
  const removeBullet = useResumeEditor((s) => s.removeBullet);

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
          {item.role || item.company || "New role"}
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
          <Field label="Role">
            <Input
              value={item.role}
              onChange={(e) => updateItem(sectionId, itemId, { role: e.target.value })}
              placeholder="Senior Engineer"
            />
          </Field>
          <Field label="Company">
            <Input
              value={item.company}
              onChange={(e) =>
                updateItem(sectionId, itemId, { company: e.target.value })
              }
              placeholder="Stripe"
            />
          </Field>
          <Field label="Location">
            <Input
              value={item.location}
              onChange={(e) =>
                updateItem(sectionId, itemId, { location: e.target.value })
              }
              placeholder="Remote"
            />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Start">
              <Input
                value={item.startDate}
                onChange={(e) =>
                  updateItem(sectionId, itemId, { startDate: e.target.value })
                }
                placeholder="Jan 2023"
              />
            </Field>
            <Field label="End">
              <Input
                value={item.endDate}
                onChange={(e) =>
                  updateItem(sectionId, itemId, { endDate: e.target.value })
                }
                placeholder="Present"
                disabled={item.current}
              />
            </Field>
          </div>
          <label className="text-xs flex items-center gap-2 sm:col-span-2">
            <input
              type="checkbox"
              checked={item.current}
              onChange={(e) =>
                updateItem(sectionId, itemId, {
                  current: e.target.checked,
                  endDate: e.target.checked ? "" : item.endDate,
                })
              }
            />
            I currently work here
          </label>
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
          {item.bullets.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Action verb, what you did, the measurable outcome.
            </p>
          )}
          <div className="space-y-2">
            {item.bullets.map((b, i) => (
              <div key={i} className="flex gap-2 items-start">
                <Textarea
                  value={b}
                  onChange={(e) => updateBullet(sectionId, itemId, i, e.target.value)}
                  placeholder="Shipped payments retry layer that recovered $4.2M/yr in failed charges."
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

"use client";

import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { useResumeEditor } from "@/lib/stores/resume-editor";
import { ContactCard } from "./ContactCard";
import { SectionCard } from "./SectionCard";
import { AddSectionMenu } from "./AddSectionMenu";

export function SectionPanel() {
  const sections = useResumeEditor((s) => s.doc.sections);
  const moveSection = useResumeEditor((s) => s.moveSection);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = sections.findIndex((s) => s.id === active.id);
    const newIdx = sections.findIndex((s) => s.id === over.id);
    if (oldIdx >= 0 && newIdx >= 0) moveSection(oldIdx, newIdx);
  }

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6 space-y-3">
      <ContactCard />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext
          items={sections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {sections.map((section) => (
            <SectionCard key={section.id} sectionId={section.id} />
          ))}
        </SortableContext>
      </DndContext>
      <AddSectionMenu />
    </div>
  );
}

"use client";

import { Textarea } from "@/components/ui/textarea";
import { useResumeEditor } from "@/lib/stores/resume-editor";

export function CustomBody({ sectionId }: { sectionId: string }) {
  const section = useResumeEditor((s) =>
    s.doc.sections.find((x) => x.id === sectionId),
  );
  const update = useResumeEditor((s) => s.updateCustom);
  if (!section || section.kind !== "custom") return null;
  return (
    <Textarea
      value={section.body}
      onChange={(e) => update(section.id, e.target.value)}
      placeholder="Awards, publications, volunteer work…"
      rows={4}
    />
  );
}

"use client";

import { Textarea } from "@/components/ui/textarea";
import { useResumeEditor } from "@/lib/stores/resume-editor";

export function SummaryBody({ sectionId }: { sectionId: string }) {
  const section = useResumeEditor((s) =>
    s.doc.sections.find((x) => x.id === sectionId),
  );
  const update = useResumeEditor((s) => s.updateSummary);
  if (!section || section.kind !== "summary") return null;
  return (
    <Textarea
      value={section.body}
      onChange={(e) => update(section.id, e.target.value)}
      placeholder="Backend engineer with 6+ years building reliable payments infrastructure…"
      rows={4}
    />
  );
}

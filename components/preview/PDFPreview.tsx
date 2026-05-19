"use client";

import dynamic from "next/dynamic";
import { createElement } from "react";
import { useResumeEditor } from "@/lib/stores/resume-editor";
import { Skeleton } from "@/components/ui/skeleton";
import { MinimalTemplate } from "@/components/templates/MinimalTemplate";
import { ModernTemplate } from "@/components/templates/ModernTemplate";
import { ClassicTemplate } from "@/components/templates/ClassicTemplate";
import type {
  ResumeDocument,
  TemplateId,
  Theme,
} from "@/lib/schemas/resume";

const StablePDFFrame = dynamic(
  () => import("./StablePDFFrame").then((m) => m.StablePDFFrame),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full grid place-items-center bg-muted/30">
        <Skeleton className="w-[60%] h-[80%]" />
      </div>
    ),
  },
);

export function PDFPreview() {
  const doc = useResumeEditor((s) => s.doc);
  const theme = useResumeEditor((s) => s.theme);
  const templateId = useResumeEditor((s) => s.templateId);

  return (
    <StablePDFFrame
      showToolbar={false}
      document={createElement(PreviewTemplate, { templateId, doc, theme })}
    />
  );
}

function PreviewTemplate({
  templateId,
  doc,
  theme,
}: {
  templateId: TemplateId;
  doc: ResumeDocument;
  theme: Theme;
}) {
  switch (templateId) {
    case "modern":
      return <ModernTemplate doc={doc} theme={theme} />;
    case "classic":
      return <ClassicTemplate doc={doc} theme={theme} />;
    case "minimal":
    default:
      return <MinimalTemplate doc={doc} theme={theme} />;
  }
}

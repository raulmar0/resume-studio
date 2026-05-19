"use client";

import dynamic from "next/dynamic";
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

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((m) => m.PDFViewer),
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
    <PDFViewer
      width="100%"
      height="100%"
      showToolbar={false}
      className="border-0 bg-transparent"
    >
      <PreviewTemplate templateId={templateId} doc={doc} theme={theme} />
    </PDFViewer>
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

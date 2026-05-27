"use client";

import { useResumeEditor } from "@/lib/stores/resume-editor";
import type {
  ResumeDocument,
  TemplateId,
  Theme,
} from "@/lib/schemas/resume";
import { HtmlMinimalTemplate } from "@/components/templates/html/MinimalTemplate";
import { HtmlModernTemplate } from "@/components/templates/html/ModernTemplate";
import { HtmlClassicTemplate } from "@/components/templates/html/ClassicTemplate";

export function LivePreview() {
  const doc = useResumeEditor((s) => s.doc);
  const theme = useResumeEditor((s) => s.theme);
  const templateId = useResumeEditor((s) => s.templateId);

  return (
    <div className="h-full w-full overflow-auto bg-neutral-200/60">
      <div className="flex min-h-full justify-center p-6">
        <div
          className="bg-white shadow-lg"
          style={{
            width: "210mm",
            minHeight: "297mm",
            flexShrink: 0,
          }}
        >
          <HtmlTemplate templateId={templateId} doc={doc} theme={theme} />
        </div>
      </div>
    </div>
  );
}

function HtmlTemplate({
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
      return <HtmlModernTemplate doc={doc} theme={theme} />;
    case "classic":
      return <HtmlClassicTemplate doc={doc} theme={theme} />;
    case "minimal":
    default:
      return <HtmlMinimalTemplate doc={doc} theme={theme} />;
  }
}

import type { ComponentType } from "react";
import type { ResumeDocument, Theme, TemplateId } from "@/lib/schemas/resume";
import { MinimalTemplate } from "@/components/templates/MinimalTemplate";
import { ModernTemplate } from "@/components/templates/ModernTemplate";
import { ClassicTemplate } from "@/components/templates/ClassicTemplate";

export type TemplateComponent = ComponentType<{
  doc: ResumeDocument;
  theme: Theme;
}>;

export const TEMPLATE_COMPONENTS: Record<TemplateId, TemplateComponent> = {
  minimal: MinimalTemplate,
  modern: ModernTemplate,
  classic: ClassicTemplate,
};

export function getTemplateComponent(id: string): TemplateComponent {
  return (
    TEMPLATE_COMPONENTS[id as TemplateId] ?? TEMPLATE_COMPONENTS.minimal
  );
}

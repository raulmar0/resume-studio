import type { TemplateId } from "@/lib/schemas/resume";

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  description: string;
}

export const TEMPLATES: TemplateMeta[] = [
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean single column. Sans-serif. Always parses cleanly.",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Single column with a subtle accent rule and section headers.",
  },
  {
    id: "classic",
    name: "Classic",
    description: "Serif headers in a single column. Reads like a hiring memo.",
  },
];

export function getTemplate(id: string | undefined | null): TemplateMeta {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}

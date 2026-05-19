import { parse, stringify } from "yaml";
import { z } from "zod";
import {
  ResumeDocumentSchema,
  TEMPLATE_IDS,
  ThemeSchema,
  defaultTheme,
  emptyDocument,
  type ResumeDocument,
  type TemplateId,
  type Theme,
} from "./schemas/resume";

export type ResumeTransferFormat = "json" | "yaml";

export interface ResumeTransferData {
  title: string;
  templateId: TemplateId;
  theme: Theme;
  document: ResumeDocument;
}

const ResumeTransferSchema = z.object({
  title: z.string().trim().min(1).max(120).catch("Imported Resume"),
  templateId: z.enum(TEMPLATE_IDS).catch("minimal" as TemplateId),
  theme: ThemeSchema,
  document: ResumeDocumentSchema,
});

export function buildResumeImportTemplate(
  format: ResumeTransferFormat,
): string {
  return exportResumeData(
    {
      title: "Imported Resume",
      templateId: "minimal",
      theme: defaultTheme(),
      document: emptyDocument(),
    },
    format,
  );
}

export function exportResumeData(
  data: ResumeTransferData,
  format: ResumeTransferFormat,
): string {
  const parsed = ResumeTransferSchema.parse(data);
  if (format === "json") {
    return `${JSON.stringify(parsed, null, 2)}\n`;
  }
  return stringify(parsed);
}

export function parseResumeImport(
  source: string,
  format: ResumeTransferFormat,
): ResumeTransferData {
  try {
    const raw = format === "json" ? JSON.parse(source) : parse(source);
    return ResumeTransferSchema.parse(raw);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown parse error";
    throw new Error(`Invalid resume import: ${message}`);
  }
}

export function inferResumeTransferFormat(
  filename: string,
): ResumeTransferFormat {
  return /\.ya?ml$/i.test(filename) ? "yaml" : "json";
}

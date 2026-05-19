import { parse, stringify } from "yaml";
import { z } from "zod";
import {
  ResumeDocumentSchema,
  TEMPLATE_IDS,
  ThemeSchema,
  defaultTheme,
  emptyDocument,
  newSection,
  type Contact,
  type ContactLink,
  type ResumeDocument,
  type Section,
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

/* ------------------------------------------------------------------ */
/*  Flexible import: try full format, then document-only, then        */
/*  JSON Resume (https://jsonresume.org/)                               */
/* ------------------------------------------------------------------ */

function tryParseFullFormat(raw: unknown): ResumeTransferData | null {
  const result = ResumeTransferSchema.safeParse(raw);
  return result.success ? result.data : null;
}

function tryParseDocumentOnly(raw: unknown): ResumeTransferData | null {
  const result = ResumeDocumentSchema.safeParse(raw);
  if (!result.success) return null;
  return {
    title: "Imported Resume",
    templateId: "minimal",
    theme: defaultTheme(),
    document: result.data,
  };
}

/* JSON Resume -> our schema mapping */
function mapJsonResume(raw: unknown): ResumeTransferData | null {
  const basicsSchema = z.object({
    name: z.string().optional(),
    label: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    url: z.string().optional(),
    location: z
      .union([
        z.string(),
        z.object({ city: z.string().optional(), region: z.string().optional(), countryCode: z.string().optional() }).transform((l) =>
          [l.city, l.region, l.countryCode].filter(Boolean).join(", "),
        ),
      ])
      .optional(),
    profiles: z
      .array(
        z.object({
          network: z.string().optional(),
          url: z.string().optional(),
          username: z.string().optional(),
        }),
      )
      .optional(),
  });

  const workSchema = z.array(
    z.object({
      name: z.string().optional(),
      position: z.string().optional(),
      url: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      summary: z.string().optional(),
      highlights: z.array(z.string()).optional(),
    }),
  );

  const educationSchema = z.array(
    z.object({
      institution: z.string().optional(),
      area: z.string().optional(),
      studyType: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      score: z.string().optional(),
      courses: z.array(z.string()).optional(),
    }),
  );

  const skillsSchema = z.array(
    z.object({
      name: z.string().optional(),
      level: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    }),
  );

  const projectsSchema = z.array(
    z.object({
      name: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      description: z.string().optional(),
      highlights: z.array(z.string()).optional(),
      url: z.string().optional(),
    }),
  );

  const certificatesSchema = z.array(
    z.object({
      name: z.string().optional(),
      date: z.string().optional(),
      url: z.string().optional(),
      issuer: z.string().optional(),
    }),
  );

  const languagesSchema = z.array(
    z.object({
      language: z.string().optional(),
      fluency: z.string().optional(),
    }),
  );

  const jsonResume = z
    .object({
      basics: basicsSchema.optional(),
      work: workSchema.optional(),
      education: educationSchema.optional(),
      skills: skillsSchema.optional(),
      projects: projectsSchema.optional(),
      certificates: certificatesSchema.optional(),
      languages: languagesSchema.optional(),
    })
    .safeParse(raw);

  if (!jsonResume.success) return null;

  const d = jsonResume.data;

  // Only treat as JSON Resume if at least one known field is present
  const hasAnyKnownField =
    d.basics !== undefined ||
    d.work !== undefined ||
    d.education !== undefined ||
    d.skills !== undefined ||
    d.projects !== undefined ||
    d.certificates !== undefined ||
    d.languages !== undefined;

  if (!hasAnyKnownField) return null;

  const contact: Contact = {
    fullName: d.basics?.name ?? "",
    headline: d.basics?.label ?? "",
    email: d.basics?.email ?? "",
    phone: d.basics?.phone ?? "",
    location: typeof d.basics?.location === "string" ? d.basics.location : "",
    links: (d.basics?.profiles ?? [])
      .map((p): ContactLink | null => {
        const url = p.url?.trim();
        if (!url) return null;
        return {
          id: crypto.randomUUID(),
          label: p.network?.trim() || p.username?.trim() || "Link",
          url,
        };
      })
      .filter((x): x is ContactLink => x !== null),
  };

  const sections: Section[] = [];

  if (d.work && d.work.length > 0) {
    sections.push({
      id: crypto.randomUUID(),
      kind: "experience",
      title: "Experience",
      items: d.work.map((w) => ({
        id: crypto.randomUUID(),
        company: w.name ?? "",
        role: w.position ?? "",
        location: "",
        startDate: w.startDate ?? "",
        endDate: w.endDate ?? "",
        current: false,
        bullets: w.highlights ?? [],
      })),
    });
  }

  if (d.education && d.education.length > 0) {
    sections.push({
      id: crypto.randomUUID(),
      kind: "education",
      title: "Education",
      items: d.education.map((e) => ({
        id: crypto.randomUUID(),
        school: e.institution ?? "",
        degree: e.studyType ?? "",
        field: e.area ?? "",
        location: "",
        startDate: e.startDate ?? "",
        endDate: e.endDate ?? "",
        details: e.score ?? "",
      })),
    });
  }

  if (d.skills && d.skills.length > 0) {
    sections.push({
      id: crypto.randomUUID(),
      kind: "skills",
      title: "Skills",
      groups: d.skills.map((s) => ({
        id: crypto.randomUUID(),
        label: s.name ?? "",
        skills: s.keywords ?? [],
      })),
    });
  }

  if (d.projects && d.projects.length > 0) {
    sections.push({
      id: crypto.randomUUID(),
      kind: "projects",
      title: "Projects",
      items: d.projects.map((p) => ({
        id: crypto.randomUUID(),
        name: p.name ?? "",
        url: p.url ?? "",
        description: p.description ?? "",
        bullets: p.highlights ?? [],
        tech: [],
      })),
    });
  }

  if (d.certificates && d.certificates.length > 0) {
    sections.push({
      id: crypto.randomUUID(),
      kind: "certifications",
      title: "Certifications",
      items: d.certificates.map((c) => ({
        id: crypto.randomUUID(),
        name: c.name ?? "",
        issuer: c.issuer ?? "",
        date: c.date ?? "",
        url: c.url ?? "",
      })),
    });
  }

  if (d.languages && d.languages.length > 0) {
    sections.push({
      id: crypto.randomUUID(),
      kind: "languages",
      title: "Languages",
      items: d.languages.map((l) => ({
        id: crypto.randomUUID(),
        name: l.language ?? "",
        proficiency: (l.fluency as
          | "Native"
          | "Fluent"
          | "Professional"
          | "Conversational"
          | "Basic"
          | undefined) ?? "Professional",
      })),
    });
  }

  return {
    title: d.basics?.name ? `${d.basics.name} — Resume` : "Imported Resume",
    templateId: "minimal",
    theme: defaultTheme(),
    document: { contact, sections },
  };
}

export function parseResumeImport(
  source: string,
  format: ResumeTransferFormat,
): ResumeTransferData {
  let raw: unknown;
  try {
    raw = format === "json" ? JSON.parse(source) : parse(source);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown parse error";
    throw new Error(`Invalid resume import: ${message}`);
  }

  const result =
    tryParseFullFormat(raw) ??
    tryParseDocumentOnly(raw) ??
    mapJsonResume(raw);

  if (result) {
    return result;
  }

  throw new Error(
    "Invalid resume import: file does not match the expected format. " +
      "Supported formats: full export, document-only, or JSON Resume.",
  );
}

export function inferResumeTransferFormat(
  filename: string,
): ResumeTransferFormat {
  return /\.ya?ml$/i.test(filename) ? "yaml" : "json";
}

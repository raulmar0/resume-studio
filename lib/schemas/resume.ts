import { z } from "zod";

const id = () =>
  z
    .string()
    .min(1)
    .default(() =>
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2),
    );

export const ThemeSchema = z.object({
  accent: z.string().default("#0f172a"),
  fontFamily: z.enum(["Helvetica", "Times", "Courier"]).default("Helvetica"),
  fontSize: z.number().min(8).max(14).default(10.5),
  margin: z.enum(["narrow", "normal", "wide"]).default("normal"),
  lineHeight: z.number().min(1).max(2).default(1.35),
});
export type Theme = z.infer<typeof ThemeSchema>;

export const ContactLinkSchema = z.object({
  id: id(),
  label: z.string().min(1).max(40),
  url: z.string().min(1).max(200),
});

export const ContactSchema = z.object({
  fullName: z.string().default(""),
  headline: z.string().default(""),
  email: z.string().default(""),
  phone: z.string().default(""),
  location: z.string().default(""),
  links: z.array(ContactLinkSchema).default([]),
});
export type Contact = z.infer<typeof ContactSchema>;

const baseSection = z.object({
  id: id(),
  title: z.string().min(1).max(60),
});

export const SummarySection = baseSection.extend({
  kind: z.literal("summary"),
  body: z.string().default(""),
});

export const ExperienceItem = z.object({
  id: id(),
  company: z.string().default(""),
  role: z.string().default(""),
  location: z.string().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  current: z.boolean().default(false),
  bullets: z.array(z.string()).default([]),
});
export const ExperienceSection = baseSection.extend({
  kind: z.literal("experience"),
  items: z.array(ExperienceItem).default([]),
});

export const EducationItem = z.object({
  id: id(),
  school: z.string().default(""),
  degree: z.string().default(""),
  field: z.string().default(""),
  location: z.string().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  details: z.string().default(""),
});
export const EducationSection = baseSection.extend({
  kind: z.literal("education"),
  items: z.array(EducationItem).default([]),
});

export const SkillGroup = z.object({
  id: id(),
  label: z.string().default(""),
  skills: z.array(z.string()).default([]),
});
export const SkillsSection = baseSection.extend({
  kind: z.literal("skills"),
  groups: z.array(SkillGroup).default([]),
});

export const ProjectItem = z.object({
  id: id(),
  name: z.string().default(""),
  url: z.string().default(""),
  description: z.string().default(""),
  bullets: z.array(z.string()).default([]),
  tech: z.array(z.string()).default([]),
});
export const ProjectsSection = baseSection.extend({
  kind: z.literal("projects"),
  items: z.array(ProjectItem).default([]),
});

export const CertificationItem = z.object({
  id: id(),
  name: z.string().default(""),
  issuer: z.string().default(""),
  date: z.string().default(""),
  url: z.string().default(""),
});
export const CertificationsSection = baseSection.extend({
  kind: z.literal("certifications"),
  items: z.array(CertificationItem).default([]),
});

export const LanguageItem = z.object({
  id: id(),
  name: z.string().default(""),
  proficiency: z
    .enum(["Native", "Fluent", "Professional", "Conversational", "Basic"])
    .default("Professional"),
});
export const LanguagesSection = baseSection.extend({
  kind: z.literal("languages"),
  items: z.array(LanguageItem).default([]),
});

export const CustomSection = baseSection.extend({
  kind: z.literal("custom"),
  body: z.string().default(""),
});

export const SectionSchema = z.discriminatedUnion("kind", [
  SummarySection,
  ExperienceSection,
  EducationSection,
  SkillsSection,
  ProjectsSection,
  CertificationsSection,
  LanguagesSection,
  CustomSection,
]);
export type Section = z.infer<typeof SectionSchema>;
export type SectionKind = Section["kind"];

export const ResumeDocumentSchema = z.object({
  contact: ContactSchema,
  sections: z.array(SectionSchema).default([]),
});
export type ResumeDocument = z.infer<typeof ResumeDocumentSchema>;

export const TEMPLATE_IDS = ["minimal", "modern", "classic"] as const;
export const TemplateIdSchema = z.enum(TEMPLATE_IDS);
export type TemplateId = z.infer<typeof TemplateIdSchema>;

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export function emptyDocument(): ResumeDocument {
  return {
    contact: {
      fullName: "",
      headline: "",
      email: "",
      phone: "",
      location: "",
      links: [],
    },
    sections: [
      { id: newId(), kind: "summary", title: "Summary", body: "" },
      { id: newId(), kind: "experience", title: "Experience", items: [] },
      { id: newId(), kind: "education", title: "Education", items: [] },
      { id: newId(), kind: "skills", title: "Skills", groups: [] },
    ],
  };
}

export function defaultTheme(): Theme {
  return ThemeSchema.parse({});
}

export const SECTION_LABELS: Record<SectionKind, string> = {
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  languages: "Languages",
  custom: "Custom section",
};

export function newSection(kind: SectionKind): Section {
  const base = { id: newId(), title: SECTION_LABELS[kind] };
  switch (kind) {
    case "summary":
      return { ...base, kind, body: "" };
    case "experience":
      return { ...base, kind, items: [] };
    case "education":
      return { ...base, kind, items: [] };
    case "skills":
      return { ...base, kind, groups: [] };
    case "projects":
      return { ...base, kind, items: [] };
    case "certifications":
      return { ...base, kind, items: [] };
    case "languages":
      return { ...base, kind, items: [] };
    case "custom":
      return { ...base, kind, body: "" };
  }
}

export function parseDocument(value: unknown): ResumeDocument {
  const result = ResumeDocumentSchema.safeParse(value);
  return result.success ? result.data : emptyDocument();
}

export function parseTheme(value: unknown): Theme {
  const result = ThemeSchema.safeParse(value);
  return result.success ? result.data : defaultTheme();
}

import { describe, expect, it } from "vitest";
import {
  buildResumeImportTemplate,
  exportResumeData,
  parseResumeImport,
} from "./resume-transfer";

const sample = {
  title: "Frontend Resume",
  templateId: "modern" as const,
  theme: {
    accent: "#0f172a",
    fontFamily: "Helvetica" as const,
    fontSize: 10.5,
    margin: "normal" as const,
    lineHeight: 1.35,
  },
  document: {
    contact: {
      fullName: "Raul Barajas",
      headline: "Frontend Engineer",
      email: "raul@example.com",
      phone: "",
      location: "Monterrey",
      links: [],
    },
    sections: [
      {
        id: "summary",
        kind: "summary" as const,
        title: "Summary",
        body: "Builds readable product UI.",
      },
    ],
  },
};

describe("resume transfer", () => {
  it("round-trips exported JSON", () => {
    const exported = exportResumeData(sample, "json");

    expect(parseResumeImport(exported, "json")).toEqual(sample);
  });

  it("round-trips exported YAML", () => {
    const exported = exportResumeData(sample, "yaml");

    expect(exported).toContain("title: Frontend Resume");
    expect(parseResumeImport(exported, "yaml")).toEqual(sample);
  });

  it("provides a valid import template", () => {
    const template = buildResumeImportTemplate("yaml");

    expect(parseResumeImport(template, "yaml").document.sections).toHaveLength(4);
  });

  it("rejects invalid import data", () => {
    expect(() => parseResumeImport('{"document": null}', "json")).toThrow(
      "Invalid resume import",
    );
  });

  it("accepts document-only JSON", () => {
    const docOnly = {
      contact: {
        fullName: "Jane Doe",
        headline: "Designer",
        email: "jane@example.com",
        phone: "",
        location: "NYC",
        links: [],
      },
      sections: [
        {
          id: "exp-1",
          kind: "experience" as const,
          title: "Experience",
          items: [],
        },
      ],
    };
    const parsed = parseResumeImport(JSON.stringify(docOnly), "json");
    expect(parsed.title).toBe("Imported Resume");
    expect(parsed.templateId).toBe("minimal");
    expect(parsed.document.contact.fullName).toBe("Jane Doe");
    expect(parsed.document.sections).toHaveLength(1);
  });

  it("accepts JSON Resume format", () => {
    const jsonResume = {
      basics: {
        name: "John Smith",
        label: "Engineer",
        email: "john@example.com",
        phone: "555-1234",
        location: { city: "San Francisco", region: "CA" },
        profiles: [{ network: "GitHub", url: "https://github.com/john" }],
      },
      work: [
        {
          name: "Acme",
          position: "Dev",
          startDate: "2020-01",
          endDate: "2023-01",
          highlights: ["Shipped feature A"],
        },
      ],
      education: [
        {
          institution: "MIT",
          area: "CS",
          studyType: "BS",
        },
      ],
      skills: [
        {
          name: "Frontend",
          keywords: ["React", "TypeScript"],
        },
      ],
      projects: [
        {
          name: "Cool App",
          description: "A cool app",
          highlights: ["Open source"],
        },
      ],
      certificates: [
        {
          name: "AWS Certified",
          issuer: "Amazon",
          date: "2023-06",
        },
      ],
      languages: [
        {
          language: "English",
          fluency: "Native",
        },
      ],
    };

    const parsed = parseResumeImport(JSON.stringify(jsonResume), "json");
    expect(parsed.title).toBe("John Smith — Resume");
    expect(parsed.document.contact.fullName).toBe("John Smith");
    expect(parsed.document.contact.location).toBe("San Francisco, CA");
    expect(parsed.document.contact.links).toHaveLength(1);
    expect(parsed.document.sections).toHaveLength(6);

    const experience = parsed.document.sections.find((s) => s.kind === "experience");
    expect(experience).toBeDefined();
    expect(experience?.kind === "experience" && experience.items[0].company).toBe("Acme");

    const education = parsed.document.sections.find((s) => s.kind === "education");
    expect(education).toBeDefined();

    const skills = parsed.document.sections.find((s) => s.kind === "skills");
    expect(skills?.kind === "skills" && skills.groups[0].skills).toEqual([
      "React",
      "TypeScript",
    ]);

    const projects = parsed.document.sections.find((s) => s.kind === "projects");
    expect(projects).toBeDefined();

    const certifications = parsed.document.sections.find((s) => s.kind === "certifications");
    expect(certifications).toBeDefined();

    const languages = parsed.document.sections.find((s) => s.kind === "languages");
    expect(languages?.kind === "languages" && languages.items[0].proficiency).toBe("Native");
  });
});

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
    expect(() => parseResumeImport("{\"document\": null}", "json")).toThrow(
      "Invalid resume import",
    );
  });
});

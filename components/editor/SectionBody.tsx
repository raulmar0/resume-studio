"use client";

import { useResumeEditor } from "@/lib/stores/resume-editor";
import { SummaryBody } from "./sections/SummaryBody";
import { ExperienceBody } from "./sections/ExperienceBody";
import { EducationBody } from "./sections/EducationBody";
import { SkillsBody } from "./sections/SkillsBody";
import { ProjectsBody } from "./sections/ProjectsBody";
import { CertificationsBody } from "./sections/CertificationsBody";
import { LanguagesBody } from "./sections/LanguagesBody";
import { CustomBody } from "./sections/CustomBody";

export function SectionBody({ sectionId }: { sectionId: string }) {
  const section = useResumeEditor((s) =>
    s.doc.sections.find((x) => x.id === sectionId),
  );
  if (!section) return null;
  switch (section.kind) {
    case "summary":
      return <SummaryBody sectionId={section.id} />;
    case "experience":
      return <ExperienceBody sectionId={section.id} />;
    case "education":
      return <EducationBody sectionId={section.id} />;
    case "skills":
      return <SkillsBody sectionId={section.id} />;
    case "projects":
      return <ProjectsBody sectionId={section.id} />;
    case "certifications":
      return <CertificationsBody sectionId={section.id} />;
    case "languages":
      return <LanguagesBody sectionId={section.id} />;
    case "custom":
      return <CustomBody sectionId={section.id} />;
  }
}

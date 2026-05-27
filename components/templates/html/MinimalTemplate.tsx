"use client";

import type { ResumeDocument, Theme } from "@/lib/schemas/resume";
import {
  HtmlContactLine,
  HtmlSectionRenderer,
  makeHtmlBaseStyles,
} from "./shared";

export function HtmlMinimalTemplate({
  doc,
  theme,
}: {
  doc: ResumeDocument;
  theme: Theme;
}) {
  const { base, sectionStyles } = makeHtmlBaseStyles(theme);

  return (
    <div style={base.page}>
      <div style={base.name}>{doc.contact.fullName || "\u00a0"}</div>
      {doc.contact.headline ? (
        <div style={base.headline}>{doc.contact.headline}</div>
      ) : null}
      <HtmlContactLine
        parts={[doc.contact.email, doc.contact.phone, doc.contact.location]}
        links={doc.contact.links}
      />

      {doc.sections.map((section) => (
        <div key={section.id} style={sectionStyles.sectionWrap}>
          <div style={sectionStyles.sectionTitle}>{section.title}</div>
          <HtmlSectionRenderer section={section} styles={sectionStyles} />
        </div>
      ))}
    </div>
  );
}

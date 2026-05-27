"use client";

import type { CSSProperties } from "react";
import type { ResumeDocument, Theme } from "@/lib/schemas/resume";
import {
  HtmlContactLine,
  HtmlSectionRenderer,
  makeHtmlBaseStyles,
} from "./shared";

export function HtmlModernTemplate({
  doc,
  theme,
}: {
  doc: ResumeDocument;
  theme: Theme;
}) {
  const { base, sectionStyles } = makeHtmlBaseStyles(theme, {
    sectionTitle: {
      fontSize: `${theme.fontSize * 1.05}pt`,
      fontWeight: 700,
      color: theme.accent,
      marginBottom: "4pt",
      textTransform: "uppercase",
      letterSpacing: "1.2pt",
    },
  });

  const headerWrap: CSSProperties = {
    borderBottom: `1.5pt solid ${theme.accent}`,
    paddingBottom: "6pt",
    marginBottom: "8pt",
  };

  return (
    <div style={base.page}>
      <div style={headerWrap}>
        <div style={{ ...base.name, color: theme.accent }}>
          {doc.contact.fullName || "\u00a0"}
        </div>
        {doc.contact.headline ? (
          <div style={base.headline}>{doc.contact.headline}</div>
        ) : null}
        <HtmlContactLine
          parts={[
            doc.contact.email,
            doc.contact.phone,
            doc.contact.location,
          ]}
          links={doc.contact.links}
        />
      </div>

      {doc.sections.map((section) => (
        <div key={section.id} style={sectionStyles.sectionWrap}>
          <div style={sectionStyles.sectionTitle}>{section.title}</div>
          <HtmlSectionRenderer section={section} styles={sectionStyles} />
        </div>
      ))}
    </div>
  );
}

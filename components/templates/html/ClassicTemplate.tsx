"use client";

import type { CSSProperties } from "react";
import type { ResumeDocument, Theme } from "@/lib/schemas/resume";
import {
  HtmlContactLine,
  HtmlSectionRenderer,
  makeHtmlBaseStyles,
} from "./shared";

export function HtmlClassicTemplate({
  doc,
  theme,
}: {
  doc: ResumeDocument;
  theme: Theme;
}) {
  const serifTheme = { ...theme, fontFamily: "Times" as const };
  const { base, sectionStyles } = makeHtmlBaseStyles(serifTheme, {
    sectionTitle: {
      fontFamily: '"Times New Roman", Times, serif',
      fontSize: `${theme.fontSize * 1.15}pt`,
      fontWeight: 700,
      marginBottom: "4pt",
      borderBottom: "0.75pt solid #222222",
      paddingBottom: "2pt",
      textTransform: "uppercase",
      letterSpacing: "1pt",
    },
  });

  const headerWrap: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "8pt",
  };

  const nameStyle: CSSProperties = {
    fontSize: `${theme.fontSize * 2.2}pt`,
    fontWeight: 700,
    fontFamily: '"Times New Roman", Times, serif',
    marginBottom: "2pt",
  };

  const headlineStyle: CSSProperties = {
    color: "#333333",
    fontFamily: '"Times New Roman", Times, serif',
    marginBottom: "4pt",
  };

  return (
    <div style={base.page}>
      <div style={headerWrap}>
        <div style={nameStyle}>{doc.contact.fullName || "\u00a0"}</div>
        {doc.contact.headline ? (
          <div style={headlineStyle}>{doc.contact.headline}</div>
        ) : null}
        <HtmlContactLine
          parts={[
            doc.contact.email,
            doc.contact.phone,
            doc.contact.location,
          ]}
          links={doc.contact.links}
          style={{ justifyContent: "center" }}
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

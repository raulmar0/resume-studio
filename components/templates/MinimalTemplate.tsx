"use client";

import { Document, Page, View, Text } from "@react-pdf/renderer";
import type { ResumeDocument, Theme } from "@/lib/schemas/resume";
import {
  ContactLine,
  SectionRenderer,
  makeBaseStyles,
} from "./shared";

export function MinimalTemplate({
  doc,
  theme,
}: {
  doc: ResumeDocument;
  theme: Theme;
}) {
  const { base, sectionStyles } = makeBaseStyles(theme);

  return (
    <Document
      author={doc.contact.fullName || undefined}
      title={`${doc.contact.fullName || "Resume"} — Resume`}
    >
      <Page size="A4" style={base.page}>
        <Text style={base.name}>{doc.contact.fullName || " "}</Text>
        {doc.contact.headline ? (
          <Text style={base.headline}>{doc.contact.headline}</Text>
        ) : null}
        <ContactLine
          parts={[doc.contact.email, doc.contact.phone, doc.contact.location]}
          links={doc.contact.links}
        />

        {doc.sections.map((section) => (
          <View key={section.id} style={base.sectionWrap}>
            <Text style={base.sectionTitle}>{section.title}</Text>
            <SectionRenderer section={section} styles={sectionStyles} />
          </View>
        ))}
      </Page>
    </Document>
  );
}

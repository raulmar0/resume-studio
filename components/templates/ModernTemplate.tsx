"use client";

import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { ResumeDocument, Theme } from "@/lib/schemas/resume";
import { ContactLine, SectionRenderer, makeBaseStyles } from "./shared";

export function ModernTemplate({
  doc,
  theme,
}: {
  doc: ResumeDocument;
  theme: Theme;
}) {
  const { base, sectionStyles } = makeBaseStyles(theme, {
    sectionTitle: {
      fontSize: theme.fontSize * 1.05,
      fontWeight: 700,
      color: theme.accent,
      marginBottom: 4,
      textTransform: "uppercase",
      letterSpacing: 1.2,
    },
  });

  const local = StyleSheet.create({
    headerWrap: {
      borderBottomWidth: 1.5,
      borderBottomColor: theme.accent,
      paddingBottom: 6,
      marginBottom: 8,
    },
  });

  return (
    <Document
      author={doc.contact.fullName || undefined}
      title={`${doc.contact.fullName || "Resume"} — Resume`}
    >
      <Page size="A4" style={base.page}>
        <View style={local.headerWrap}>
          <Text style={[base.name, { color: theme.accent }]}>
            {doc.contact.fullName || " "}
          </Text>
          {doc.contact.headline ? (
            <Text style={base.headline}>{doc.contact.headline}</Text>
          ) : null}
          <ContactLine
            parts={[doc.contact.email, doc.contact.phone, doc.contact.location]}
            links={doc.contact.links}
          />
        </View>

        {doc.sections.map((section) => (
          <View key={section.id} style={base.sectionWrap}>
            <Text style={sectionStyles.sectionTitle}>{section.title}</Text>
            <SectionRenderer section={section} styles={sectionStyles} />
          </View>
        ))}
      </Page>
    </Document>
  );
}

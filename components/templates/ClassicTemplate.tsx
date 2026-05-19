"use client";

import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { ResumeDocument, Theme } from "@/lib/schemas/resume";
import { ContactLine, SectionRenderer, makeBaseStyles } from "./shared";

export function ClassicTemplate({
  doc,
  theme,
}: {
  doc: ResumeDocument;
  theme: Theme;
}) {
  const serifTheme = { ...theme, fontFamily: "Times" as const };
  const { base, sectionStyles } = makeBaseStyles(serifTheme, {
    sectionTitle: {
      fontFamily: "Times-Roman",
      fontSize: theme.fontSize * 1.15,
      fontWeight: 700,
      marginBottom: 4,
      borderBottomWidth: 0.75,
      borderBottomColor: "#222222",
      paddingBottom: 2,
    },
  });

  const local = StyleSheet.create({
    headerWrap: {
      alignItems: "center",
      marginBottom: 8,
    },
    name: { fontSize: theme.fontSize * 2.2, fontWeight: 700, fontFamily: "Times-Roman", marginBottom: 2 },
    headline: { color: "#333333", fontFamily: "Times-Roman", marginBottom: 4 },
  });

  return (
    <Document
      author={doc.contact.fullName || undefined}
      title={`${doc.contact.fullName || "Resume"} — Resume`}
    >
      <Page size="A4" style={base.page}>
        <View style={local.headerWrap}>
          <Text style={local.name}>{doc.contact.fullName || " "}</Text>
          {doc.contact.headline ? (
            <Text style={local.headline}>{doc.contact.headline}</Text>
          ) : null}
          <ContactLine
            parts={[doc.contact.email, doc.contact.phone, doc.contact.location]}
            links={doc.contact.links}
            style={{ justifyContent: "center" }}
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

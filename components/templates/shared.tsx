"use client";

import { View, Text, Link, StyleSheet } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import type { Section, Theme } from "@/lib/schemas/resume";

export const MARGIN_PT = { narrow: 24, normal: 36, wide: 48 } as const;

export function formatDateRange(
  start: string,
  end: string,
  current?: boolean,
): string {
  if (!start && !end && !current) return "";
  const right = current ? "Present" : end || "";
  if (!start) return right;
  if (!right) return start;
  return `${start} — ${right}`;
}

export function joinNonEmpty(parts: (string | undefined | null)[]) {
  return parts.filter(Boolean).join(" · ");
}

export function ContactLine({
  parts,
  links,
  style,
}: {
  parts: string[];
  links: { id: string; label: string; url: string }[];
  style?: Style;
}) {
  const cleaned = parts.filter(Boolean);
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        rowGap: 2,
        ...style,
      }}
    >
      {cleaned.map((p, i) => (
        <Text key={`p-${i}`}>
          {p}
          {(i < cleaned.length - 1 || links.length > 0) && "  ·  "}
        </Text>
      ))}
      {links.map((l, i) => (
        <Text key={l.id}>
          <Link src={l.url}>{l.label}</Link>
          {i < links.length - 1 && "  ·  "}
        </Text>
      ))}
    </View>
  );
}

export function Bullet({ text, style }: { text: string; style?: object }) {
  return (
    <View style={{ flexDirection: "row", marginBottom: 1, ...style }}>
      <Text style={{ width: 10 }}>•</Text>
      <Text style={{ flex: 1 }}>{text}</Text>
    </View>
  );
}

export interface SectionStyles {
  sectionWrap: Style;
  sectionTitle: Style;
  itemWrap: Style;
  itemHeaderRow: Style;
  itemTitle: Style;
  itemSubtitle: Style;
  itemMeta: Style;
  body: Style;
  pillRow: Style;
  pill: Style;
}

export function SectionRenderer({
  section,
  styles,
}: {
  section: Section;
  styles: SectionStyles;
}) {
  switch (section.kind) {
    case "summary":
      return section.body ? <Text style={styles.body}>{section.body}</Text> : null;

    case "experience":
      return (
        <>
          {section.items.map((item) => (
            <View key={item.id} style={styles.itemWrap}>
              <View style={styles.itemHeaderRow}>
                <Text style={styles.itemTitle}>
                  {joinNonEmpty([item.role, item.company])}
                </Text>
                <Text style={styles.itemMeta}>
                  {formatDateRange(item.startDate, item.endDate, item.current)}
                </Text>
              </View>
              {item.location ? (
                <Text style={styles.itemSubtitle}>{item.location}</Text>
              ) : null}
              {item.bullets.length > 0 && (
                <View style={{ marginTop: 2 }}>
                  {item.bullets.map((b, i) => (
                    <Bullet key={i} text={b} />
                  ))}
                </View>
              )}
            </View>
          ))}
        </>
      );

    case "education":
      return (
        <>
          {section.items.map((item) => (
            <View key={item.id} style={styles.itemWrap}>
              <View style={styles.itemHeaderRow}>
                <Text style={styles.itemTitle}>
                  {joinNonEmpty([item.school, item.location])}
                </Text>
                <Text style={styles.itemMeta}>
                  {formatDateRange(item.startDate, item.endDate)}
                </Text>
              </View>
              {(item.degree || item.field) && (
                <Text style={styles.itemSubtitle}>
                  {joinNonEmpty([item.degree, item.field])}
                </Text>
              )}
              {item.details ? (
                <Text style={styles.body}>{item.details}</Text>
              ) : null}
            </View>
          ))}
        </>
      );

    case "skills":
      return (
        <>
          {section.groups.map((g) => (
            <View key={g.id} style={{ marginBottom: 2 }}>
              {g.label ? (
                <Text>
                  <Text style={styles.itemTitle}>{g.label}: </Text>
                  <Text>{g.skills.join(", ")}</Text>
                </Text>
              ) : (
                <Text>{g.skills.join(", ")}</Text>
              )}
            </View>
          ))}
        </>
      );

    case "projects":
      return (
        <>
          {section.items.map((item) => (
            <View key={item.id} style={styles.itemWrap}>
              <View style={styles.itemHeaderRow}>
                <Text style={styles.itemTitle}>
                  {item.url ? (
                    <Link src={item.url}>{item.name}</Link>
                  ) : (
                    item.name
                  )}
                </Text>
                {item.tech.length > 0 && (
                  <Text style={styles.itemMeta}>{item.tech.join(", ")}</Text>
                )}
              </View>
              {item.description ? (
                <Text style={styles.body}>{item.description}</Text>
              ) : null}
              {item.bullets.length > 0 && (
                <View style={{ marginTop: 2 }}>
                  {item.bullets.map((b, i) => (
                    <Bullet key={i} text={b} />
                  ))}
                </View>
              )}
            </View>
          ))}
        </>
      );

    case "certifications":
      return (
        <>
          {section.items.map((item) => (
            <View key={item.id} style={styles.itemWrap}>
              <View style={styles.itemHeaderRow}>
                <Text style={styles.itemTitle}>
                  {item.url ? (
                    <Link src={item.url}>{item.name}</Link>
                  ) : (
                    item.name
                  )}
                </Text>
                <Text style={styles.itemMeta}>{item.date}</Text>
              </View>
              {item.issuer ? (
                <Text style={styles.itemSubtitle}>{item.issuer}</Text>
              ) : null}
            </View>
          ))}
        </>
      );

    case "languages":
      return (
        <View style={styles.pillRow}>
          {section.items.map((item) => (
            <Text key={item.id} style={styles.pill}>
              {item.name}
              {item.proficiency ? ` — ${item.proficiency}` : ""}
            </Text>
          ))}
        </View>
      );

    case "custom":
      return section.body ? <Text style={styles.body}>{section.body}</Text> : null;
  }
}

export function toPdfFontFamily(family: Theme["fontFamily"]): string {
  switch (family) {
    case "Times":
      return "Times-Roman";
    case "Courier":
      return "Courier";
    case "Helvetica":
    default:
      return "Helvetica";
  }
}

export function makeBaseStyles(theme: Theme, override?: Partial<SectionStyles>) {
  const pdfFont = toPdfFontFamily(theme.fontFamily);
  const base = StyleSheet.create({
    // @react-pdf style record

    page: {
      padding: MARGIN_PT[theme.margin],
      fontFamily: pdfFont,
      fontSize: theme.fontSize,
      lineHeight: theme.lineHeight,
      color: "#111111",
    },
    name: {
      fontSize: theme.fontSize * 2.0,
      fontWeight: 700,
      fontFamily: pdfFont,
      marginBottom: 2,
    },
    headline: {
      color: "#444444",
      fontFamily: pdfFont,
      marginBottom: 6,
    },
    sectionWrap: { marginTop: 10 },
    sectionTitle: {
      fontSize: theme.fontSize * 1.05,
      fontWeight: 700,
      fontFamily: pdfFont,
      marginBottom: 4,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    itemWrap: { marginBottom: 6 },
    itemHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 8,
    },
    itemTitle: { fontWeight: 700 },
    itemSubtitle: { color: "#444444", marginBottom: 1 },
    itemMeta: { color: "#555555" },
    body: { marginBottom: 1 },
    pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
    pill: {
      borderWidth: 0.5,
      borderColor: "#888888",
      paddingVertical: 1,
      paddingHorizontal: 4,
      borderRadius: 2,
      fontSize: theme.fontSize * 0.95,
    },
  });

  return { base, sectionStyles: { ...base, ...override } as SectionStyles };
}

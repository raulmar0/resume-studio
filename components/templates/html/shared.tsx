"use client";

import type { CSSProperties } from "react";
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
  return `${start} \u2014 ${right}`;
}

export function joinNonEmpty(parts: (string | undefined | null)[]) {
  return parts.filter(Boolean).join(" \u00b7 ");
}

export function toCssFontFamily(family: Theme["fontFamily"]): string {
  switch (family) {
    case "Times":
      return '"Times New Roman", Times, serif';
    case "Courier":
      return '"Courier New", Courier, monospace';
    case "Helvetica":
    default:
      return "Helvetica, Arial, sans-serif";
  }
}

export interface HtmlSectionStyles {
  sectionWrap: CSSProperties;
  sectionTitle: CSSProperties;
  itemWrap: CSSProperties;
  itemHeaderRow: CSSProperties;
  itemTitle: CSSProperties;
  itemSubtitle: CSSProperties;
  itemMeta: CSSProperties;
  body: CSSProperties;
  pillRow: CSSProperties;
  pill: CSSProperties;
}

export function makeHtmlBaseStyles(
  theme: Theme,
  override?: Partial<HtmlSectionStyles>,
) {
  const fontFamily = toCssFontFamily(theme.fontFamily);
  const fs = theme.fontSize;

  const page: CSSProperties = {
    padding: `${MARGIN_PT[theme.margin]}pt`,
    fontFamily,
    fontSize: `${fs}pt`,
    lineHeight: theme.lineHeight,
    color: "#111111",
  };

  const name: CSSProperties = {
    fontSize: `${fs * 2.0}pt`,
    fontWeight: 700,
    fontFamily,
    marginBottom: "2pt",
  };

  const headline: CSSProperties = {
    color: "#444444",
    fontFamily,
    marginBottom: "6pt",
  };

  const sectionWrap: CSSProperties = { marginTop: "10pt" };

  const sectionTitle: CSSProperties = {
    fontSize: `${fs * 1.05}pt`,
    fontWeight: 700,
    fontFamily,
    marginBottom: "4pt",
    textTransform: "uppercase",
    letterSpacing: "1pt",
  };

  const itemWrap: CSSProperties = { marginBottom: "6pt" };

  const itemHeaderRow: CSSProperties = {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: "8pt",
  };

  const itemTitle: CSSProperties = { fontWeight: 700 };
  const itemSubtitle: CSSProperties = { color: "#444444", marginBottom: "1pt" };
  const itemMeta: CSSProperties = { color: "#555555" };
  const body: CSSProperties = { marginBottom: "1pt" };

  const pillRow: CSSProperties = {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: "6pt",
  };

  const pill: CSSProperties = {
    border: "0.5pt solid #888888",
    paddingTop: "1pt",
    paddingBottom: "1pt",
    paddingLeft: "4pt",
    paddingRight: "4pt",
    borderRadius: "2pt",
    fontSize: `${fs * 0.95}pt`,
  };

  const base = { page, name, headline };
  const sectionStyles: HtmlSectionStyles = {
    sectionWrap,
    sectionTitle,
    itemWrap,
    itemHeaderRow,
    itemTitle,
    itemSubtitle,
    itemMeta,
    body,
    pillRow,
    pill,
    ...override,
  };

  return { base, sectionStyles };
}

export function HtmlContactLine({
  parts,
  links,
  style,
}: {
  parts: string[];
  links: { id: string; label: string; url: string }[];
  style?: CSSProperties;
}) {
  const cleaned = parts.filter(Boolean);
  const hasItems = cleaned.length > 0 || links.length > 0;
  if (!hasItems) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        rowGap: "2pt",
        ...style,
      }}
    >
      {cleaned.map((p, i) => (
        <span key={`p-${i}`}>
          {p}
          {(i < cleaned.length - 1 || links.length > 0) && "  \u00b7  "}
        </span>
      ))}
      {links.map((l, i) => (
        <span key={l.id}>
          <a
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "inherit", textDecoration: "none" }}
          >
            {l.label}
          </a>
          {i < links.length - 1 && "  \u00b7  "}
        </span>
      ))}
    </div>
  );
}

export function HtmlBullet({
  text,
  style,
}: {
  text: string;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        marginBottom: "1pt",
        ...style,
      }}
    >
      <span style={{ width: "10pt", flexShrink: 0 }}>&bull;</span>
      <span style={{ flex: 1 }}>{text}</span>
    </div>
  );
}

export function HtmlSectionRenderer({
  section,
  styles,
}: {
  section: Section;
  styles: HtmlSectionStyles;
}) {
  switch (section.kind) {
    case "summary":
      return section.body ? (
        <p style={{ ...styles.body, margin: 0 }}>{section.body}</p>
      ) : null;

    case "experience":
      return (
        <>
          {section.items.map((item) => (
            <div key={item.id} style={styles.itemWrap}>
              <div style={styles.itemHeaderRow}>
                <span style={styles.itemTitle}>
                  {joinNonEmpty([item.role, item.company])}
                </span>
                <span style={styles.itemMeta}>
                  {formatDateRange(
                    item.startDate,
                    item.endDate,
                    item.current,
                  )}
                </span>
              </div>
              {item.location ? (
                <div style={styles.itemSubtitle}>{item.location}</div>
              ) : null}
              {item.bullets.length > 0 && (
                <div style={{ marginTop: "2pt" }}>
                  {item.bullets.map((b, i) => (
                    <HtmlBullet key={i} text={b} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </>
      );

    case "education":
      return (
        <>
          {section.items.map((item) => (
            <div key={item.id} style={styles.itemWrap}>
              <div style={styles.itemHeaderRow}>
                <span style={styles.itemTitle}>
                  {joinNonEmpty([item.school, item.location])}
                </span>
                <span style={styles.itemMeta}>
                  {formatDateRange(item.startDate, item.endDate)}
                </span>
              </div>
              {(item.degree || item.field) && (
                <div style={styles.itemSubtitle}>
                  {joinNonEmpty([item.degree, item.field])}
                </div>
              )}
              {item.details ? (
                <p style={{ ...styles.body, margin: 0 }}>{item.details}</p>
              ) : null}
            </div>
          ))}
        </>
      );

    case "skills":
      return (
        <>
          {section.groups.map((g) => (
            <div key={g.id} style={{ marginBottom: "2pt" }}>
              {g.label ? (
                <span>
                  <span style={styles.itemTitle}>{g.label}: </span>
                  <span>{g.skills.join(", ")}</span>
                </span>
              ) : (
                <span>{g.skills.join(", ")}</span>
              )}
            </div>
          ))}
        </>
      );

    case "projects":
      return (
        <>
          {section.items.map((item) => (
            <div key={item.id} style={styles.itemWrap}>
              <div style={styles.itemHeaderRow}>
                <span style={styles.itemTitle}>
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "inherit", textDecoration: "none" }}
                    >
                      {item.name}
                    </a>
                  ) : (
                    item.name
                  )}
                </span>
                {item.tech.length > 0 && (
                  <span style={styles.itemMeta}>{item.tech.join(", ")}</span>
                )}
              </div>
              {item.description ? (
                <p style={{ ...styles.body, margin: 0 }}>{item.description}</p>
              ) : null}
              {item.bullets.length > 0 && (
                <div style={{ marginTop: "2pt" }}>
                  {item.bullets.map((b, i) => (
                    <HtmlBullet key={i} text={b} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </>
      );

    case "certifications":
      return (
        <>
          {section.items.map((item) => (
            <div key={item.id} style={styles.itemWrap}>
              <div style={styles.itemHeaderRow}>
                <span style={styles.itemTitle}>
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "inherit", textDecoration: "none" }}
                    >
                      {item.name}
                    </a>
                  ) : (
                    item.name
                  )}
                </span>
                <span style={styles.itemMeta}>{item.date}</span>
              </div>
              {item.issuer ? (
                <div style={styles.itemSubtitle}>{item.issuer}</div>
              ) : null}
            </div>
          ))}
        </>
      );

    case "languages":
      return (
        <div style={styles.pillRow}>
          {section.items.map((item) => (
            <span key={item.id} style={styles.pill}>
              {item.name}
              {item.proficiency ? ` \u2014 ${item.proficiency}` : ""}
            </span>
          ))}
        </div>
      );

    case "custom":
      return section.body ? (
        <p style={{ ...styles.body, margin: 0 }}>{section.body}</p>
      ) : null;
  }
}

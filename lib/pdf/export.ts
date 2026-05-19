"use client";

import { pdf, type DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";

export function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "resume"
  );
}

function ymd(d = new Date()): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

export async function downloadResumePdf({
  document,
  filename,
}: {
  document: ReactElement;
  filename: string;
}): Promise<void> {
  const blob = await pdf(
    document as unknown as ReactElement<DocumentProps>,
  ).toBlob();
  const url = URL.createObjectURL(blob);
  const a = window.document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  window.document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function buildResumeFilename(title: string): string {
  return `${slugify(title)}-${ymd()}.pdf`;
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { pdf, type DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function StablePDFFrame({
  document,
  title = "Resume preview",
  showToolbar = true,
}: {
  document: ReactElement;
  title?: string;
  showToolbar?: boolean;
}) {
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [renderFailed, setRenderFailed] = useState(false);

  const activeUrlRef = useRef<string | null>(null);
  const pendingUrlRef = useRef<string | null>(null);
  const latestDocument = useRef(document);
  const documentVersion = useRef(0);
  const pendingVersion = useRef<number | null>(null);
  const mounted = useRef(false);
  const rendering = useRef(false);
  const queued = useRef(false);

  const renderLatest = useCallback(async () => {
    if (rendering.current) {
      queued.current = true;
      return;
    }

    rendering.current = true;

    try {
      while (mounted.current) {
        queued.current = false;
        const documentToRender = latestDocument.current;
        const versionToRender = documentVersion.current;

        try {
          const blob = await pdf(
            documentToRender as unknown as ReactElement<DocumentProps>,
          ).toBlob();

          if (!mounted.current) return;
          if (
            queued.current ||
            latestDocument.current !== documentToRender ||
            documentVersion.current !== versionToRender
          ) {
            continue;
          }

          const nextUrl = URL.createObjectURL(blob);
          if (pendingUrlRef.current) {
            URL.revokeObjectURL(pendingUrlRef.current);
          }
          pendingUrlRef.current = nextUrl;
          pendingVersion.current = versionToRender;
          setPendingUrl(nextUrl);
          setRenderFailed(false);
          return;
        } catch {
          if (!mounted.current) return;
          if (
            queued.current ||
            latestDocument.current !== documentToRender ||
            documentVersion.current !== versionToRender
          ) {
            continue;
          }
          if (!activeUrlRef.current) setRenderFailed(true);
          return;
        }
      }
    } finally {
      rendering.current = false;
    }
  }, []);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
      if (activeUrlRef.current) URL.revokeObjectURL(activeUrlRef.current);
      if (pendingUrlRef.current) URL.revokeObjectURL(pendingUrlRef.current);
    };
  }, []);

  useEffect(() => {
    latestDocument.current = document;
    documentVersion.current += 1;
    void renderLatest();
  }, [document, renderLatest]);

  function promotePendingUrl(url: string) {
    if (pendingUrlRef.current !== url) return;
    if (pendingVersion.current !== documentVersion.current) {
      URL.revokeObjectURL(url);
      pendingUrlRef.current = null;
      pendingVersion.current = null;
      setPendingUrl(null);
      return;
    }

    const previousActiveUrl = activeUrlRef.current;
    activeUrlRef.current = url;
    pendingUrlRef.current = null;
    pendingVersion.current = null;
    setActiveUrl(url);
    setPendingUrl(null);
    setRenderFailed(false);

    if (previousActiveUrl && previousActiveUrl !== url) {
      URL.revokeObjectURL(previousActiveUrl);
    }
  }

  const toolbarFlag = showToolbar ? 1 : 0;

  return (
    <div className="relative h-full w-full overflow-hidden bg-muted/30">
      {activeUrl ? (
        <iframe
          key={activeUrl}
          src={`${activeUrl}#toolbar=${toolbarFlag}`}
          title={title}
          className="absolute inset-0 h-full w-full border-0 bg-transparent"
        />
      ) : renderFailed ? (
        <div className="grid h-full w-full place-items-center p-6 text-center text-sm text-muted-foreground">
          Could not render preview.
        </div>
      ) : (
        <div className="grid h-full w-full place-items-center">
          <Skeleton className="h-[80%] w-[60%]" />
        </div>
      )}

      {pendingUrl ? (
        <iframe
          key={pendingUrl}
          src={`${pendingUrl}#toolbar=${toolbarFlag}`}
          title={`${title} loading`}
          className="pointer-events-none absolute inset-0 h-full w-full border-0 bg-transparent opacity-0"
          aria-hidden="true"
          tabIndex={-1}
          onLoad={() => promotePendingUrl(pendingUrl)}
        />
      ) : null}
    </div>
  );
}

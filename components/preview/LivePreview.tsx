"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useResumeEditor } from "@/lib/stores/resume-editor";
import type {
  ResumeDocument,
  TemplateId,
  Theme,
} from "@/lib/schemas/resume";
import { HtmlMinimalTemplate } from "@/components/templates/html/MinimalTemplate";
import { HtmlModernTemplate } from "@/components/templates/html/ModernTemplate";
import { HtmlClassicTemplate } from "@/components/templates/html/ClassicTemplate";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

const A4_WIDTH_PX = 793.7;
const A4_HEIGHT_PX = 1122.5;
const PADDING = 48;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;

export function LivePreview() {
  const doc = useResumeEditor((s) => s.doc);
  const theme = useResumeEditor((s) => s.theme);
  const templateId = useResumeEditor((s) => s.templateId);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [mode, setMode] = useState<"fit" | "manual">("fit");
  const [manualZoom, setManualZoom] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const fitZoom =
    containerWidth > 0
      ? Math.min((containerWidth - PADDING) / A4_WIDTH_PX, 1)
      : 1;

  const zoom = mode === "fit" ? fitZoom : manualZoom;

  const zoomIn = useCallback(() => {
    setMode("manual");
    setManualZoom((z) => Math.min(z + ZOOM_STEP, MAX_ZOOM));
  }, []);

  const zoomOut = useCallback(() => {
    setMode("manual");
    setManualZoom((z) => Math.max(z - ZOOM_STEP, MIN_ZOOM));
  }, []);

  const zoomFit = useCallback(() => {
    setMode("fit");
  }, []);

  const scaledWidth = A4_WIDTH_PX * zoom;
  const scaledHeight = A4_HEIGHT_PX * zoom;

  return (
    <div className="relative h-full w-full">
      <div
        ref={containerRef}
        className="h-full w-full overflow-auto bg-neutral-200/60"
      >
        <div
          className="flex justify-center p-6"
          style={{
            minWidth: scaledWidth + PADDING,
            minHeight: scaledHeight + PADDING,
          }}
        >
          <div
            className="bg-white shadow-lg"
            style={{
              width: "210mm",
              minHeight: "297mm",
              flexShrink: 0,
              transform: `scale(${zoom})`,
              transformOrigin: "top center",
            }}
          >
            <HtmlTemplate templateId={templateId} doc={doc} theme={theme} />
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 flex items-center gap-1 rounded-lg border bg-background/90 px-1 py-1 shadow-md backdrop-blur-sm">
        <Button variant="ghost" size="icon-xs" onClick={zoomOut}>
          <ZoomOut />
        </Button>
        <button
          onClick={zoomFit}
          className="min-w-[3.5rem] px-1 text-center text-xs font-medium tabular-nums hover:bg-muted rounded-md py-0.5 cursor-pointer"
        >
          {Math.round(zoom * 100)}%
        </button>
        <Button variant="ghost" size="icon-xs" onClick={zoomIn}>
          <ZoomIn />
        </Button>
        <div className="mx-0.5 h-4 w-px bg-border" />
        <Button
          variant={mode === "fit" ? "secondary" : "ghost"}
          size="icon-xs"
          onClick={zoomFit}
          title="Fit to page"
        >
          <Maximize2 />
        </Button>
      </div>
    </div>
  );
}

function HtmlTemplate({
  templateId,
  doc,
  theme,
}: {
  templateId: TemplateId;
  doc: ResumeDocument;
  theme: Theme;
}) {
  switch (templateId) {
    case "modern":
      return <HtmlModernTemplate doc={doc} theme={theme} />;
    case "classic":
      return <HtmlClassicTemplate doc={doc} theme={theme} />;
    case "minimal":
    default:
      return <HtmlMinimalTemplate doc={doc} theme={theme} />;
  }
}

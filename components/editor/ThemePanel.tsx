"use client";

import { useResumeEditor } from "@/lib/stores/resume-editor";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ThemePanel() {
  const theme = useResumeEditor((s) => s.theme);
  const setTheme = useResumeEditor((s) => s.setTheme);

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs">Accent color</Label>
        <div className="flex items-center gap-2">
          <input
            aria-label="Accent color"
            type="color"
            className="h-8 w-12 rounded border bg-background cursor-pointer"
            value={theme.accent}
            onChange={(e) => setTheme({ accent: e.target.value })}
          />
          <Input
            value={theme.accent}
            onChange={(e) => setTheme({ accent: e.target.value })}
            className="h-8"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Font family</Label>
        <Select
          value={theme.fontFamily}
          onValueChange={(v) =>
            setTheme({
              fontFamily: v as "Helvetica" | "Times" | "Courier",
            })
          }
        >
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Helvetica">Helvetica (sans-serif)</SelectItem>
            <SelectItem value="Times">Times (serif)</SelectItem>
            <SelectItem value="Courier">Courier (mono)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">
          Font size <span className="text-muted-foreground">({theme.fontSize}pt)</span>
        </Label>
        <input
          aria-label="Font size"
          type="range"
          min={9}
          max={13}
          step={0.5}
          value={theme.fontSize}
          onChange={(e) => setTheme({ fontSize: Number(e.target.value) })}
          className="w-full"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Margin</Label>
        <Select
          value={theme.margin}
          onValueChange={(v) =>
            setTheme({ margin: v as "narrow" | "normal" | "wide" })
          }
        >
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="narrow">Narrow</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="wide">Wide</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">
          Line height{" "}
          <span className="text-muted-foreground">({theme.lineHeight})</span>
        </Label>
        <input
          aria-label="Line height"
          type="range"
          min={1.1}
          max={1.6}
          step={0.05}
          value={theme.lineHeight}
          onChange={(e) => setTheme({ lineHeight: Number(e.target.value) })}
          className="w-full"
        />
      </div>
    </div>
  );
}

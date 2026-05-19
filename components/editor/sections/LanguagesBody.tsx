"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useResumeEditor } from "@/lib/stores/resume-editor";

const PROFICIENCIES = [
  "Native",
  "Fluent",
  "Professional",
  "Conversational",
  "Basic",
] as const;

export function LanguagesBody({ sectionId }: { sectionId: string }) {
  const section = useResumeEditor((s) =>
    s.doc.sections.find((x) => x.id === sectionId),
  );
  const addItem = useResumeEditor((s) => s.addItem);
  const updateItem = useResumeEditor((s) => s.updateItem);
  const removeItem = useResumeEditor((s) => s.removeItem);
  if (!section || section.kind !== "languages") return null;

  return (
    <div className="space-y-3">
      {section.items.map((item) => (
        <div
          key={item.id}
          className="rounded-md border bg-background p-3 grid sm:grid-cols-[1fr_180px_auto] gap-3 items-end"
        >
          <div className="space-y-1.5">
            <Label className="text-xs">Language</Label>
            <Input
              value={item.name}
              onChange={(e) =>
                updateItem(section.id, item.id, { name: e.target.value })
              }
              placeholder="Spanish"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Proficiency</Label>
            <Select
              value={item.proficiency}
              onValueChange={(v) =>
                updateItem(section.id, item.id, { proficiency: v })
              }
            >
              <SelectTrigger size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROFICIENCIES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeItem(section.id, item.id)}
            aria-label="Remove"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={() => addItem(section.id)}
        className="w-full"
      >
        <Plus className="size-4" />
        Add language
      </Button>
    </div>
  );
}

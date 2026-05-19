"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResumeEditor } from "@/lib/stores/resume-editor";

export function CertificationsBody({ sectionId }: { sectionId: string }) {
  const section = useResumeEditor((s) =>
    s.doc.sections.find((x) => x.id === sectionId),
  );
  const addItem = useResumeEditor((s) => s.addItem);
  const updateItem = useResumeEditor((s) => s.updateItem);
  const removeItem = useResumeEditor((s) => s.removeItem);
  if (!section || section.kind !== "certifications") return null;

  return (
    <div className="space-y-3">
      {section.items.map((item) => (
        <div
          key={item.id}
          className="rounded-md border bg-background p-3 grid sm:grid-cols-2 gap-3 relative"
        >
          <div className="space-y-1.5">
            <Label className="text-xs">Name</Label>
            <Input
              value={item.name}
              onChange={(e) =>
                updateItem(section.id, item.id, { name: e.target.value })
              }
              placeholder="AWS Solutions Architect"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Issuer</Label>
            <Input
              value={item.issuer}
              onChange={(e) =>
                updateItem(section.id, item.id, { issuer: e.target.value })
              }
              placeholder="Amazon Web Services"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Date</Label>
            <Input
              value={item.date}
              onChange={(e) =>
                updateItem(section.id, item.id, { date: e.target.value })
              }
              placeholder="Mar 2024"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Credential URL</Label>
            <Input
              value={item.url}
              onChange={(e) =>
                updateItem(section.id, item.id, { url: e.target.value })
              }
              placeholder="https://"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 size-7"
            onClick={() => removeItem(section.id, item.id)}
            aria-label="Remove"
          >
            <Trash2 className="size-3.5" />
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
        Add certification
      </Button>
    </div>
  );
}

"use client";

import { KeyboardEvent, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useResumeEditor } from "@/lib/stores/resume-editor";

export function SkillsBody({ sectionId }: { sectionId: string }) {
  const section = useResumeEditor((s) =>
    s.doc.sections.find((x) => x.id === sectionId),
  );
  const addSkillGroup = useResumeEditor((s) => s.addSkillGroup);
  const updateSkillGroup = useResumeEditor((s) => s.updateSkillGroup);
  const removeSkillGroup = useResumeEditor((s) => s.removeSkillGroup);

  if (!section || section.kind !== "skills") return null;

  return (
    <div className="space-y-3">
      {section.groups.map((g) => (
        <GroupRow
          key={g.id}
          label={g.label}
          skills={g.skills}
          onChangeLabel={(label) =>
            updateSkillGroup(section.id, g.id, { label })
          }
          onChangeSkills={(skills) =>
            updateSkillGroup(section.id, g.id, { skills })
          }
          onRemove={() => removeSkillGroup(section.id, g.id)}
        />
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={() => addSkillGroup(section.id)}
        className="w-full"
      >
        <Plus className="size-4" />
        Add skill group
      </Button>
    </div>
  );
}

function GroupRow({
  label,
  skills,
  onChangeLabel,
  onChangeSkills,
  onRemove,
}: {
  label: string;
  skills: string[];
  onChangeLabel: (s: string) => void;
  onChangeSkills: (skills: string[]) => void;
  onRemove: () => void;
}) {
  const [draft, setDraft] = useState("");

  function commit() {
    const value = draft.trim();
    if (!value) return;
    if (skills.includes(value)) {
      setDraft("");
      return;
    }
    onChangeSkills([...skills, value]);
    setDraft("");
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && draft === "" && skills.length > 0) {
      onChangeSkills(skills.slice(0, -1));
    }
  }

  return (
    <div className="rounded-md border bg-background p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Input
          value={label}
          placeholder="Category (e.g. Languages)"
          onChange={(e) => onChangeLabel(e.target.value)}
          className="h-8"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          aria-label="Remove group"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {skills.map((s, i) => (
          <span
            key={`${s}-${i}`}
            className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs"
          >
            {s}
            <button
              type="button"
              onClick={() =>
                onChangeSkills(skills.filter((_, idx) => idx !== i))
              }
              aria-label={`Remove ${s}`}
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
      </div>
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKey}
        onBlur={commit}
        placeholder="Type a skill and press Enter"
        className="h-8"
      />
    </div>
  );
}

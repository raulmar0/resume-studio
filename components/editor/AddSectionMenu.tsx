"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useResumeEditor,
} from "@/lib/stores/resume-editor";
import {
  SECTION_LABELS,
  type SectionKind,
} from "@/lib/schemas/resume";

const ORDER: SectionKind[] = [
  "summary",
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
  "languages",
  "custom",
];

export function AddSectionMenu() {
  const addSection = useResumeEditor((s) => s.addSection);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline" className="w-full" />}
      >
        <Plus className="size-4" />
        Add section
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-56">
        {ORDER.map((kind) => (
          <DropdownMenuItem key={kind} onSelect={() => addSection(kind)}>
            {SECTION_LABELS[kind]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

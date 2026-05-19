"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createResume } from "@/app/resumes/actions";
import { TEMPLATES } from "@/lib/templates/registry";
import { cn } from "@/lib/utils";

export function NewResumeDialog() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [templateId, setTemplateId] = useState<string>("minimal");

  function onSubmit(formData: FormData) {
    formData.set("templateId", templateId);
    startTransition(async () => {
      try {
        await createResume(formData);
      } catch (err) {
        if (err && typeof err === "object" && "digest" in err) {
          // Next.js redirect - re-throw so navigation happens
          throw err;
        }
        toast.error("Could not create resume", {
          description: err instanceof Error ? err.message : undefined,
        });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" />
        New resume
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New resume</DialogTitle>
          <DialogDescription>
            Pick a starting template. You can switch templates anytime in the
            editor.
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g. Backend Engineer — Stripe"
              autoFocus
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Template</Label>
            <div className="grid grid-cols-3 gap-2">
              {TEMPLATES.map((tpl) => (
                <button
                  type="button"
                  key={tpl.id}
                  onClick={() => setTemplateId(tpl.id)}
                  className={cn(
                    "rounded-md border text-left p-3 transition-colors",
                    templateId === tpl.id
                      ? "border-foreground bg-muted"
                      : "hover:bg-muted/50",
                  )}
                >
                  <div className="text-sm font-medium">{tpl.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {tpl.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Creating…" : "Create resume"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

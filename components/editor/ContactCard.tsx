"use client";

import { Plus, Trash2, User } from "lucide-react";
import { useResumeEditor } from "@/lib/stores/resume-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ContactCard() {
  const contact = useResumeEditor((s) => s.doc.contact);
  const setContact = useResumeEditor((s) => s.setContact);
  const addLink = useResumeEditor((s) => s.addLink);
  const updateLink = useResumeEditor((s) => s.updateLink);
  const removeLink = useResumeEditor((s) => s.removeLink);

  return (
    <div className="rounded-lg border bg-card p-4 sm:p-5 space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <User className="size-4 text-muted-foreground" />
        Contact
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Full name">
          <Input
            value={contact.fullName}
            onChange={(e) => setContact({ fullName: e.target.value })}
            placeholder="Ada Lovelace"
          />
        </Field>
        <Field label="Headline">
          <Input
            value={contact.headline}
            onChange={(e) => setContact({ headline: e.target.value })}
            placeholder="Senior Software Engineer"
          />
        </Field>
        <Field label="Email">
          <Input
            type="email"
            value={contact.email}
            onChange={(e) => setContact({ email: e.target.value })}
            placeholder="ada@example.com"
          />
        </Field>
        <Field label="Phone">
          <Input
            value={contact.phone}
            onChange={(e) => setContact({ phone: e.target.value })}
            placeholder="+1 555 0100"
          />
        </Field>
        <Field label="Location" className="sm:col-span-2">
          <Input
            value={contact.location}
            onChange={(e) => setContact({ location: e.target.value })}
            placeholder="Mexico City"
          />
        </Field>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Links</Label>
          <Button
            size="sm"
            variant="ghost"
            onClick={addLink}
            className="h-7 text-xs"
          >
            <Plus className="size-3.5" />
            Add link
          </Button>
        </div>
        {contact.links.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Add LinkedIn, GitHub, portfolio, etc.
          </p>
        )}
        <div className="space-y-2">
          {contact.links.map((l) => (
            <div key={l.id} className="flex gap-2 items-center">
              <Input
                className="max-w-[140px]"
                value={l.label}
                placeholder="Label"
                onChange={(e) => updateLink(l.id, { label: e.target.value })}
              />
              <Input
                value={l.url}
                placeholder="https://"
                onChange={(e) => updateLink(l.id, { url: e.target.value })}
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removeLink(l.id)}
                aria-label="Remove link"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

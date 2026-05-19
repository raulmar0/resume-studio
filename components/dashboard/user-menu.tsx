"use client";

import { useActionState, useEffect, useState } from "react";
import { LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { signOut, updateProfile, type ActionState } from "@/app/auth/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ActionState = { error: null, success: null };

export function UserMenu({
  name,
  email,
  displayName,
}: {
  name: string;
  email: string;
  displayName: string;
}) {
  const initial = (name || email || "?").charAt(0).toUpperCase();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant="ghost" size="sm" className="gap-2 h-9 px-2" />}
      >
        <Avatar className="size-7">
          <AvatarFallback className="text-xs">{initial}</AvatarFallback>
        </Avatar>
        <span className="hidden sm:inline text-sm">{name}</span>
      </DialogTrigger>
      <SettingsContent
        email={email}
        displayName={displayName}
        onClose={() => setOpen(false)}
      />
    </Dialog>
  );
}

function SettingsContent({
  email,
  displayName,
  onClose,
}: {
  email: string;
  displayName: string;
  onClose: () => void;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const [state, formAction, pending] = useActionState(
    updateProfile,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      onClose();
    }
    if (state.error) toast.error(state.error);
  }, [state, onClose]);

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Settings</DialogTitle>
        <DialogDescription>
          Manage your profile and appearance.
        </DialogDescription>
      </DialogHeader>

      <form action={formAction} className="space-y-5">
        <div className="space-y-3">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Profile
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName">Display name</Label>
            <Input
              id="displayName"
              name="displayName"
              defaultValue={displayName}
              placeholder="Your name"
              maxLength={80}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} disabled readOnly />
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Appearance
          </div>
          <div className="flex items-center gap-2 rounded-lg border p-1">
            <Button
              type="button"
              variant={resolvedTheme === "light" ? "secondary" : "ghost"}
              size="sm"
              className="flex-1 gap-2"
              onClick={() => setTheme("light")}
            >
              <Sun className="size-4" />
              Light
            </Button>
            <Button
              type="button"
              variant={resolvedTheme === "dark" ? "secondary" : "ghost"}
              size="sm"
              className="flex-1 gap-2"
              onClick={() => setTheme("dark")}
            >
              <Moon className="size-4" />
              Dark
            </Button>
          </div>
        </div>

        <div className="-mx-4 -mb-4 flex items-center justify-between gap-2 rounded-b-xl border-t bg-muted/50 p-4">
          <Button
            type="submit"
            formAction={signOut}
            variant="ghost"
            size="sm"
            className="gap-2"
            formNoValidate
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

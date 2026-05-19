"use client";

import { useActionState } from "react";
import { signup, type ActionState } from "@/app/auth/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SubmitButton } from "@/components/auth/submit-button";
import { AuthFeedback } from "@/components/auth/auth-feedback";
import { OAuthButton } from "@/components/auth/oauth-button";

export function SignupForm() {
  const [state, action] = useActionState<ActionState, FormData>(signup, {
    error: null,
  });

  return (
    <div className="space-y-4">
      <OAuthButton />
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Separator className="flex-1" />
        or
        <Separator className="flex-1" />
      </div>
      <form action={action} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" autoComplete="name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
          <p className="text-xs text-muted-foreground">
            8+ characters. Mix letters and numbers.
          </p>
        </div>
        <AuthFeedback error={state.error} success={state.success} />
        <SubmitButton pendingLabel="Creating account…">
          Create account
        </SubmitButton>
      </form>
    </div>
  );
}

"use client";

import { useActionState } from "react";
import { updatePassword, type ActionState } from "@/app/auth/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/auth/submit-button";
import { AuthFeedback } from "@/components/auth/auth-feedback";

export function ResetForm() {
  const [state, action] = useActionState<ActionState, FormData>(
    updatePassword,
    { error: null },
  );

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>
      <AuthFeedback error={state.error} success={state.success} />
      <SubmitButton pendingLabel="Updating…">Update password</SubmitButton>
    </form>
  );
}

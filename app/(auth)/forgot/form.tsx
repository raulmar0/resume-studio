"use client";

import { useActionState } from "react";
import {
  requestPasswordReset,
  type ActionState,
} from "@/app/auth/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/auth/submit-button";
import { AuthFeedback } from "@/components/auth/auth-feedback";

export function ForgotForm() {
  const [state, action] = useActionState<ActionState, FormData>(
    requestPasswordReset,
    { error: null },
  );

  return (
    <form action={action} className="space-y-4">
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
      <AuthFeedback error={state.error} success={state.success} />
      <SubmitButton pendingLabel="Sending…">Send reset link</SubmitButton>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, type ActionState } from "@/app/auth/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/auth/submit-button";
import { AuthFeedback } from "@/components/auth/auth-feedback";
import { OAuthButton } from "@/components/auth/oauth-button";

export function LoginForm({
  redirect,
  initialError,
}: {
  redirect?: string;
  initialError?: string;
}) {
  const [state, action] = useActionState<ActionState, FormData>(login, {
    error: initialError ?? null,
  });

  return (
    <div className="space-y-4">
      <OAuthButton next={redirect} />
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Separator className="flex-1" />
        or
        <Separator className="flex-1" />
      </div>
      <form action={action} className="space-y-4">
        <input type="hidden" name="redirect" value={redirect ?? ""} />
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
          <div className="flex justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot"
              className="text-xs text-muted-foreground hover:underline"
            >
              Forgot?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        <AuthFeedback error={state.error} />
        <SubmitButton pendingLabel="Signing in…">Sign in</SubmitButton>
      </form>
      <Button
        variant="outline"
        className="w-full"
        render={<Link href="/guest/dashboard" />}
      >
        Continue without account
      </Button>
    </div>
  );
}

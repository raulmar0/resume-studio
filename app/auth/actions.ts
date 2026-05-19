"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type ActionState = { error: string | null; success?: string | null };

const Email = z.string().email("Enter a valid email address");
const Password = z.string().min(8, "Password must be at least 8 characters");

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function login(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = Email.safeParse(formData.get("email"));
  const password = Password.safeParse(formData.get("password"));
  if (!email.success) return { error: email.error.issues[0].message };
  if (!password.success) return { error: password.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: email.data,
    password: password.data,
  });
  if (error) return { error: error.message };

  const redirectTo = (formData.get("redirect") as string) || "/dashboard";
  revalidatePath("/", "layout");
  redirect(redirectTo);
}

export async function signup(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = Email.safeParse(formData.get("email"));
  const password = Password.safeParse(formData.get("password"));
  const name = (formData.get("name") as string | null)?.trim() || undefined;
  if (!email.success) return { error: email.error.issues[0].message };
  if (!password.success) return { error: password.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: email.data,
    password: password.data,
    options: {
      emailRedirectTo: `${siteUrl()}/auth/callback`,
      data: name ? { name } : undefined,
    },
  });
  if (error) return { error: error.message };

  return {
    error: null,
    success: "Check your email to confirm your account before signing in.",
  };
}

export async function requestPasswordReset(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = Email.safeParse(formData.get("email"));
  if (!email.success) return { error: email.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email.data, {
    redirectTo: `${siteUrl()}/auth/callback?next=/reset`,
  });
  if (error) return { error: error.message };
  return {
    error: null,
    success: "If that email exists, a reset link is on its way.",
  };
}

export async function updatePassword(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const password = Password.safeParse(formData.get("password"));
  if (!password.success) return { error: password.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: password.data });
  if (error) return { error: error.message };
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

const DisplayName = z
  .string()
  .trim()
  .max(80, "Display name must be 80 characters or fewer");

export async function updateProfile(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = DisplayName.safeParse(formData.get("displayName") ?? "");
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const displayName = parsed.data.length > 0 ? parsed.data : null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in" };

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName })
    .eq("id", user.id);
  if (error) return { error: error.message };

  if (displayName !== ((user.user_metadata?.name as string | undefined) ?? null)) {
    await supabase.auth.updateUser({
      data: { name: displayName ?? "" },
    });
  }

  revalidatePath("/", "layout");
  return { error: null, success: "Profile updated." };
}

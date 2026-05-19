"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";
import {
  TEMPLATE_IDS,
  type TemplateId,
  emptyDocument,
  defaultTheme,
  parseDocument,
} from "@/lib/schemas/resume";

const TitleSchema = z.string().trim().min(1).max(120).catch("Untitled Resume");
const TemplateSchema = z
  .enum(TEMPLATE_IDS)
  .catch("minimal" as TemplateId);

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function createResume(formData: FormData) {
  const title = TitleSchema.parse(formData.get("title") ?? "Untitled Resume");
  const templateId = TemplateSchema.parse(
    formData.get("templateId") ?? "minimal",
  );

  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("resumes")
    .insert({
      user_id: user.id,
      title,
      template_id: templateId,
      theme: defaultTheme() as unknown as Json,
      document: emptyDocument() as unknown as Json,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not create resume");
  }

  revalidatePath("/dashboard");
  redirect(`/editor/${data.id}`);
}

export async function duplicateResume(id: string) {
  const { supabase, user } = await requireUser();

  const { data: source, error: readErr } = await supabase
    .from("resumes")
    .select("title, template_id, theme, document")
    .eq("id", id)
    .single();
  if (readErr || !source) {
    throw new Error(readErr?.message ?? "Resume not found");
  }

  const { error } = await supabase.from("resumes").insert({
    user_id: user.id,
    title: `${source.title} (copy)`,
    template_id: source.template_id,
    theme: source.theme as Json,
    document: parseDocument(source.document) as unknown as Json,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
}

export async function renameResume(id: string, title: string) {
  const trimmed = TitleSchema.parse(title);
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("resumes")
    .update({ title: trimmed })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  revalidatePath(`/editor/${id}`);
}

export async function deleteResume(id: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("resumes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

const SaveSchema = z.object({
  document: z.unknown(),
  theme: z.unknown().optional(),
  templateId: z.string().optional(),
});

export async function saveResume(
  id: string,
  payload: { document: unknown; theme?: unknown; templateId?: string },
) {
  const parsed = SaveSchema.parse(payload);
  const { supabase } = await requireUser();

  const update: {
    document?: Json;
    theme?: Json;
    template_id?: string;
  } = { document: parsed.document as Json };
  if (parsed.theme !== undefined) update.theme = parsed.theme as Json;
  if (parsed.templateId !== undefined) update.template_id = parsed.templateId;

  const { error } = await supabase.from("resumes").update(update).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function snapshotResume(id: string, document: unknown) {
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("resume_snapshots")
    .insert({ resume_id: id, document: document as Json });
  if (error) throw new Error(error.message);
}

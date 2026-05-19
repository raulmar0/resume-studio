import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  parseDocument,
  parseTheme,
  TemplateIdSchema,
  type TemplateId,
} from "@/lib/schemas/resume";
import { Editor } from "@/components/editor/Editor";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("resumes")
    .select("title")
    .eq("id", id)
    .single();
  return {
    title: data?.title
      ? `${data.title} — Editor`
      : "Editor · Resume Studio",
  };
}

export default async function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resumes")
    .select("id, title, template_id, theme, document")
    .eq("id", id)
    .single();

  if (error || !data) notFound();

  const templateParsed = TemplateIdSchema.safeParse(data.template_id);
  const templateId: TemplateId = templateParsed.success
    ? templateParsed.data
    : "minimal";

  return (
    <Editor
      init={{
        id: data.id,
        title: data.title,
        templateId,
        theme: parseTheme(data.theme),
        doc: parseDocument(data.document),
      }}
    />
  );
}

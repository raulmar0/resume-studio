import { FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { NewResumeDialog } from "@/components/dashboard/new-resume-dialog";
import { ResumeCard } from "@/components/dashboard/resume-card";

export const metadata = { title: "Dashboard · Resume Studio" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: resumes } = await supabase
    .from("resumes")
    .select("id, title, template_id, updated_at")
    .order("updated_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your resumes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Build, tailor, and export. Each version is its own row — duplicate
            for new applications.
          </p>
        </div>
        <NewResumeDialog />
      </div>

      {!resumes || resumes.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {resumes.map((r) => (
            <ResumeCard
              key={r.id}
              id={r.id}
              title={r.title}
              templateId={r.template_id}
              updatedAt={r.updated_at}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed p-16 text-center">
      <div className="size-12 mx-auto grid place-items-center rounded-md bg-muted">
        <FileText className="size-5 text-muted-foreground" />
      </div>
      <h2 className="mt-4 text-lg font-medium">No resumes yet</h2>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
        Create your first resume to get started. You can keep multiple versions
        — one per role you are applying to.
      </p>
      <div className="mt-6 inline-block">
        <NewResumeDialog />
      </div>
    </div>
  );
}

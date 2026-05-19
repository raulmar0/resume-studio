import Link from "next/link";
import { FileText, Sparkles, FileCheck, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex-1">
      <header className="border-b">
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <FileText className="size-5" />
            Resume Studio
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            {user ? (
              <Button render={<Link href="/dashboard" />}>Open dashboard</Button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Sign in
                </Link>
                <Button render={<Link href="/signup" />}>Get started</Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 pt-24 pb-16 text-center">
        <p className="text-sm text-muted-foreground mb-4">
          For real job hunts, not just pretty PDFs
        </p>
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">
          Resumes that pass the ATS{" "}
          <span className="text-muted-foreground">and the recruiter.</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Build multiple resume versions, tailor each to a specific role in
          minutes, and export clean PDFs that applicant tracking systems can
          actually parse.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button
            size="lg"
            render={<Link href={user ? "/dashboard" : "/signup"} />}
          >
            {user ? "Open dashboard" : "Build your resume"}
          </Button>
          <Button
            size="lg"
            variant="outline"
            render={<Link href="/login" />}
          >
            Sign in
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24 grid sm:grid-cols-3 gap-6">
        <Feature
          icon={<Layers className="size-5" />}
          title="Multiple versions"
          body="Keep one resume per role. Duplicate, tweak, and export — no template gymnastics."
        />
        <Feature
          icon={<FileCheck className="size-5" />}
          title="ATS-clean PDFs"
          body="Real selectable text, semantic structure, no images-of-text. Parses cleanly in every ATS we've tested."
        />
        <Feature
          icon={<Sparkles className="size-5" />}
          title="AI-ready (soon)"
          body="Bullet rewrite, JD tailoring, and keyword gap analysis are on the roadmap."
        />
      </section>

      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Resume Studio</span>
          <span>Built with Next.js + Supabase</span>
        </div>
      </footer>
    </div>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-lg border p-6">
      <div className="size-9 grid place-items-center rounded-md bg-muted mb-3">
        {icon}
      </div>
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

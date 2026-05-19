"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileQuestion, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Editor } from "@/components/editor/Editor";
import {
  assertLocalResumeStorageAvailable,
  getLocalResume,
  type LocalResume,
} from "@/lib/local-resumes";

export function GuestEditorPage({ id }: { id: string }) {
  const [resume, setResume] = useState<LocalResume | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        assertLocalResumeStorageAvailable();
        setResume(getLocalResume(id));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Storage failed");
      } finally {
        setLoaded(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [id]);

  if (error) {
    return (
      <GuestEditorState
        icon={<HardDrive className="size-5 text-destructive" />}
        title="Browser storage is unavailable"
        body="Guest mode needs localStorage to load and save resumes on this browser."
        detail={error}
      />
    );
  }

  if (!loaded) {
    return (
      <div className="flex h-svh flex-col">
        <Skeleton className="h-14 rounded-none" />
        <div className="grid flex-1 grid-cols-1 gap-px lg:grid-cols-2">
          <Skeleton className="h-full rounded-none" />
          <Skeleton className="hidden h-full rounded-none lg:block" />
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <GuestEditorState
        icon={<FileQuestion className="size-5 text-muted-foreground" />}
        title="Local resume not found"
        body="This guest resume is not stored on this browser anymore."
      />
    );
  }

  return (
    <Editor
      init={{
        id: resume.id,
        title: resume.title,
        templateId: resume.templateId,
        theme: resume.theme,
        doc: resume.document,
        mode: "local",
      }}
    />
  );
}

function GuestEditorState({
  icon,
  title,
  body,
  detail,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  detail?: string;
}) {
  return (
    <div className="grid min-h-svh place-items-center p-6">
      <div className="max-w-sm text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-md bg-muted">
          {icon}
        </div>
        <h1 className="mt-4 text-lg font-medium">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{body}</p>
        {detail ? <p className="mt-3 text-xs text-destructive">{detail}</p> : null}
        <Button className="mt-6" render={<Link href="/guest/dashboard" />}>
          Back to guest dashboard
        </Button>
      </div>
    </div>
  );
}

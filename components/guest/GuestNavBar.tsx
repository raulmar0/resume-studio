"use client";

import Link from "next/link";
import { FileText, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GuestNavBar() {
  return (
    <header className="border-b sticky top-0 z-30 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link
          href="/guest/dashboard"
          className="flex items-center gap-2 font-semibold"
        >
          <FileText className="size-5" />
          Resume Studio
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-muted-foreground sm:inline">
            Guest resumes are stored on this browser
          </span>
          <Button variant="outline" size="sm" render={<Link href="/login" />}>
            <LogIn className="size-4" />
            Sign in
          </Button>
        </div>
      </div>
    </header>
  );
}

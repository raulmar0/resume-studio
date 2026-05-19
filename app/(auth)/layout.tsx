import Link from "next/link";
import { FileText } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh grid place-items-center bg-muted/30 p-6">
      <div className="w-full max-w-sm space-y-6">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 text-lg font-semibold tracking-tight"
        >
          <FileText className="size-5" />
          Resume Studio
        </Link>
        {children}
      </div>
    </div>
  );
}

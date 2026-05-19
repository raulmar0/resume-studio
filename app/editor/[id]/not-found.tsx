import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="h-svh grid place-items-center bg-muted/30">
      <div className="text-center space-y-3 max-w-sm">
        <h1 className="text-2xl font-semibold">Resume not found</h1>
        <p className="text-muted-foreground text-sm">
          This resume doesn&apos;t exist or you don&apos;t have access to it.
        </p>
        <Button render={<Link href="/dashboard" />}>Back to dashboard</Button>
      </div>
    </div>
  );
}

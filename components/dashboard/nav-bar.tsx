import Link from "next/link";
import { FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { UserMenu } from "./user-menu";

export async function NavBar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const email = user?.email ?? "";
  const name = (user?.user_metadata?.name as string | undefined) ?? email;

  return (
    <header className="border-b sticky top-0 z-30 bg-background/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <FileText className="size-5" />
          Resume Studio
        </Link>
        <UserMenu name={name} email={email} />
      </div>
    </header>
  );
}

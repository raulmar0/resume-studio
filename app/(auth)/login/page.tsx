import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "./form";

export const metadata = { title: "Sign in · Resume Studio" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const params = await searchParams;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
      </CardHeader>
      <CardContent>
        <LoginForm redirect={params.redirect} initialError={params.error} />
        <p className="text-sm text-muted-foreground text-center mt-6">
          New here?{" "}
          <Link className="underline underline-offset-4" href="/signup">
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

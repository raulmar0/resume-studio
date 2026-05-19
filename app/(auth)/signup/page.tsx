import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignupForm } from "./form";

export const metadata = { title: "Create account · Resume Studio" };

export default function SignupPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
      </CardHeader>
      <CardContent>
        <SignupForm />
        <p className="text-sm text-muted-foreground text-center mt-6">
          Already have an account?{" "}
          <Link className="underline underline-offset-4" href="/login">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ForgotForm } from "./form";

export const metadata = { title: "Reset password · Resume Studio" };

export default function ForgotPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset your password</CardTitle>
      </CardHeader>
      <CardContent>
        <ForgotForm />
        <p className="text-sm text-muted-foreground text-center mt-6">
          <Link className="underline underline-offset-4" href="/login">
            Back to sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

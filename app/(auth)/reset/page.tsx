import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResetForm } from "./form";

export const metadata = { title: "Set new password · Resume Studio" };

export default function ResetPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Set a new password</CardTitle>
      </CardHeader>
      <CardContent>
        <ResetForm />
      </CardContent>
    </Card>
  );
}

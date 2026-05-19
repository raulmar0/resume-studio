import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export function AuthFeedback({
  error,
  success,
}: {
  error?: string | null;
  success?: string | null;
}) {
  if (!error && !success) return null;
  if (error)
    return (
      <Alert variant="destructive">
        <AlertTriangle className="size-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  return (
    <Alert>
      <CheckCircle2 className="size-4" />
      <AlertDescription>{success}</AlertDescription>
    </Alert>
  );
}

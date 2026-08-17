import { Badge } from "@/components/ui/badge";

/**
 * A student's `status` overloads two ideas: `approved` means the registration
 * was accepted, `active` means the payment cleared. Rendering both as the bare
 * word confuses centre owners ("approved" next to "payment not approved"), so
 * student rows get plain-English labels while payment rows keep their own.
 */
const STUDENT_LABELS: Record<string, string> = {
  pending: "pending",
  approved: "registered",
  active: "Paid",
  rejected: "rejected",
};

export function StatusBadge({
  status,
  kind = "payment",
}: {
  status: string;
  kind?: "student" | "payment";
}) {
  const v =
    status === "active"
      ? "active"
      : status === "approved"
        ? "success"
        : status === "rejected"
          ? "destructive"
          : "warning";
  const label =
    kind === "student" ? (STUDENT_LABELS[status] ?? status) : status;
  return <Badge variant={v}>{label}</Badge>;
}

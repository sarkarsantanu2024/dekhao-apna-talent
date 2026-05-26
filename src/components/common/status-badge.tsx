import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  const v =
    status === "approved" || status === "active" ? "success" :
    status === "rejected" ? "destructive" : "warning";
  return <Badge variant={v}>{status}</Badge>;
}

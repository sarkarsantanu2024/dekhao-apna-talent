import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  const v =
    status === "active" ? "active" :
    status === "approved" ? "success" :
    status === "rejected" ? "destructive" : "warning";
  return <Badge variant={v}>{status}</Badge>;
}

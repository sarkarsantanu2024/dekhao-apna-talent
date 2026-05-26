import { supabaseAdmin } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/common/status-badge";
import { PaymentActions } from "@/components/admin/payment-actions";
import { EVENT_YEAR } from "@/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Payment } from "@/types";

export const metadata = { title: "Payments" };

export default async function AdminPaymentsPage() {
  const { data } = await supabaseAdmin().from("payments").select("*").eq("event_year", EVENT_YEAR).order("created_at", { ascending: false });
  const rows = (data ?? []) as Payment[];
  return (
    <Card>
      <CardHeader><CardTitle>All payments ({rows.length})</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow>
            <TableHead>Centre</TableHead><TableHead>Amount</TableHead><TableHead>Ref</TableHead>
            <TableHead>Screenshot</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead>Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No payments yet.</TableCell></TableRow>
            ) : rows.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.center_name}</TableCell>
                <TableCell>{formatCurrency(p.amount)}</TableCell>
                <TableCell className="font-mono text-xs">{p.transaction_ref ?? "—"}</TableCell>
                <TableCell><a href={p.screenshot_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">View</a></TableCell>
                <TableCell><StatusBadge status={p.status} /></TableCell>
                <TableCell className="text-muted-foreground">{formatDate(p.created_at)}</TableCell>
                <TableCell>{p.status === "pending" ? <PaymentActions id={p.id} /> : <span className="text-xs text-muted-foreground">—</span>}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

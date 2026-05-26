import { supabaseAdmin } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaymentActions } from "@/components/admin/payment-actions";
import { EVENT_YEAR } from "@/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Payment } from "@/types";

export const metadata = { title: "Pending approvals" };

export default async function ApprovalsPage() {
  const { data } = await supabaseAdmin()
    .from("payments").select("*")
    .eq("event_year", EVENT_YEAR).eq("status", "pending")
    .order("created_at", { ascending: true });
  const rows = (data ?? []) as Payment[];
  return (
    <Card>
      <CardHeader><CardTitle>Pending payment approvals ({rows.length})</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow>
            <TableHead>Centre</TableHead><TableHead>Amount</TableHead>
            <TableHead>Ref</TableHead><TableHead>Screenshot</TableHead>
            <TableHead>Submitted</TableHead><TableHead>Action</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Nothing pending. 🎉</TableCell></TableRow>
            ) : rows.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.center_name}</TableCell>
                <TableCell>{formatCurrency(p.amount)}</TableCell>
                <TableCell className="font-mono text-xs">{p.transaction_ref ?? "—"}</TableCell>
                <TableCell><a href={p.screenshot_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">Open</a></TableCell>
                <TableCell className="text-muted-foreground">{formatDate(p.created_at)}</TableCell>
                <TableCell><PaymentActions id={p.id} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

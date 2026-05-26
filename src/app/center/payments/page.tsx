import { auth } from "@/lib/auth/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/common/status-badge";
import { PaymentUploadForm } from "@/components/forms/payment-upload-form";
import { EVENT_YEAR } from "@/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Payment } from "@/types";

export const metadata = { title: "Payments" };

export default async function CenterPaymentsPage() {
  const session = await auth();
  const { data } = await supabaseAdmin()
    .from("payments").select("*")
    .eq("center_id", session!.user.centerId).eq("event_year", EVENT_YEAR)
    .order("created_at", { ascending: false });
  const rows = (data ?? []) as Payment[];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Upload payment screenshot</CardTitle>
          <CardDescription>Pay offline, then upload a screenshot here for admin approval.</CardDescription>
        </CardHeader>
        <CardContent><PaymentUploadForm /></CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader><CardTitle>My submissions</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow>
              <TableHead>Amount</TableHead><TableHead>Ref</TableHead>
              <TableHead>Screenshot</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No payments yet.</TableCell></TableRow>
              ) : rows.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{formatCurrency(p.amount)}</TableCell>
                  <TableCell className="font-mono text-xs">{p.transaction_ref ?? "—"}</TableCell>
                  <TableCell><a href={p.screenshot_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">View</a></TableCell>
                  <TableCell><StatusBadge status={p.status} /></TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(p.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

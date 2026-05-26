import { supabaseAdmin } from "@/lib/supabase/admin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EVENT_YEAR } from "@/constants";
import type { Center } from "@/types";

export const metadata = { title: "Centres" };

export default async function CentersPage() {
  const { data } = await supabaseAdmin().from("centers").select("*").eq("event_year", EVENT_YEAR).order("created_at", { ascending: false });
  const rows = (data ?? []) as Center[];
  return (
    <Card>
      <CardHeader><CardTitle>Registered centres ({rows.length})</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow>
            <TableHead>Centre</TableHead><TableHead>Owner</TableHead>
            <TableHead>Phone</TableHead><TableHead>City</TableHead><TableHead>State</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No centres yet.</TableCell></TableRow>
            ) : rows.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.center_name}</TableCell>
                <TableCell>{c.owner_name ?? "—"}</TableCell>
                <TableCell>{c.phone ?? "—"}</TableCell>
                <TableCell>{c.city ?? "—"}</TableCell>
                <TableCell>{c.state ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

import { auth } from "@/lib/auth/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { EVENT_YEAR } from "@/constants";
import type { Student } from "@/types";

export const metadata = { title: "Chest cards" };

export default async function CenterDownloadsPage() {
  const session = await auth();
  const { data } = await supabaseAdmin()
    .from("students").select("*")
    .eq("center_id", session!.user.centerId).eq("event_year", EVENT_YEAR)
    .order("roll_number");
  const rows = (data ?? []) as Student[];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chest card downloads</CardTitle>
        <CardDescription>Downloads unlock automatically once an admin approves a matching payment.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow>
            <TableHead>Roll</TableHead><TableHead>Name</TableHead>
            <TableHead>Category</TableHead><TableHead>Status</TableHead><TableHead></TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No students yet.</TableCell></TableRow>
            ) : rows.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-mono">{s.roll_number}</TableCell>
                <TableCell>{s.full_name}</TableCell>
                <TableCell>{s.category_name}</TableCell>
                <TableCell>{s.status}</TableCell>
                <TableCell>
                  {s.status === "active" ? (
                    <Button asChild size="sm"><a href={`/api/chest-card/${s.id}`} target="_blank" rel="noreferrer">Download PDF</a></Button>
                  ) : <span className="text-xs text-muted-foreground">Locked — awaiting approval</span>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

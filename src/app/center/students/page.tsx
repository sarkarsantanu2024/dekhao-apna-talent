import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/status-badge";
import { EVENT_YEAR } from "@/constants";
import { formatDate } from "@/lib/utils";
import type { Student } from "@/types";

export const metadata = { title: "My students" };

export default async function CenterStudentsPage() {
  const session = await auth();
  const { data } = await supabaseAdmin()
    .from("students").select("*")
    .eq("center_id", session!.user.centerId).eq("event_year", EVENT_YEAR)
    .order("created_at", { ascending: false });
  const rows = (data ?? []) as Student[];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>My students ({rows.length})</CardTitle>
        <Button asChild><Link href="/center/students/new">+ Add student</Link></Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow>
            <TableHead>Roll</TableHead><TableHead>Name</TableHead><TableHead>Category</TableHead>
            <TableHead>Status</TableHead><TableHead>Added</TableHead><TableHead></TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No students yet — add your first.</TableCell></TableRow>
            ) : rows.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-mono">{s.roll_number}</TableCell>
                <TableCell>{s.full_name}</TableCell>
                <TableCell>{s.category_name}</TableCell>
                <TableCell><StatusBadge status={s.status} /></TableCell>
                <TableCell className="text-muted-foreground">{formatDate(s.created_at)}</TableCell>
                <TableCell>
                  {s.status === "active" ? (
                    <a href={`/api/chest-card/${s.id}`} className="text-sm font-medium text-primary hover:underline">Download card</a>
                  ) : <span className="text-xs text-muted-foreground">Awaiting approval</span>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

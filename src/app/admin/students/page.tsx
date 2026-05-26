import { supabaseAdmin } from "@/lib/supabase/admin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/status-badge";
import { EVENT_YEAR } from "@/constants";
import { formatDate } from "@/lib/utils";
import type { Student } from "@/types";

export const metadata = { title: "Students" };

async function getStudents(): Promise<Student[]> {
  const { data } = await supabaseAdmin()
    .from("students").select("*").eq("event_year", EVENT_YEAR)
    .order("created_at", { ascending: false }).limit(200);
  return (data ?? []) as Student[];
}

export default async function AdminStudentsPage() {
  const rows = await getStudents();
  return (
    <Card>
      <CardHeader><CardTitle>All students ({rows.length})</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow>
            <TableHead>Roll</TableHead><TableHead>Name</TableHead><TableHead>Category</TableHead>
            <TableHead>Centre</TableHead><TableHead>Status</TableHead><TableHead>Added</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No students yet.</TableCell></TableRow>
            ) : rows.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-mono">{s.roll_number}</TableCell>
                <TableCell>{s.full_name}</TableCell>
                <TableCell>{s.category_name}</TableCell>
                <TableCell>{s.center_name}</TableCell>
                <TableCell><StatusBadge status={s.status} /></TableCell>
                <TableCell className="text-muted-foreground">{formatDate(s.created_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

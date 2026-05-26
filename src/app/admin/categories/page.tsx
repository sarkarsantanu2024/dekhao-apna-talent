import { supabaseAdmin } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Category } from "@/types";

export const metadata = { title: "Categories" };

export default async function CategoriesAdminPage() {
  const { data } = await supabaseAdmin().from("categories").select("*").order("name");
  const rows = (data ?? []) as Category[];
  return (
    <Card>
      <CardHeader><CardTitle>Event categories</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow>
            <TableHead>Name</TableHead><TableHead>Prefix</TableHead>
            <TableHead>Fee</TableHead><TableHead>Active</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {rows.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="font-mono">{c.prefix}</TableCell>
                <TableCell>₹{c.fee}</TableCell>
                <TableCell><Badge variant={c.active ? "success" : "secondary"}>{c.active ? "Active" : "Disabled"}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

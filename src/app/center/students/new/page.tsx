import { auth } from "@/lib/auth/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StudentForm } from "@/components/forms/student-form";
import type { Category } from "@/types";

export const metadata = { title: "Add student" };

export default async function NewStudentPage() {
  const session = await auth();
  const sb = supabaseAdmin();

  const [{ data: cats }, { data: centre }] = await Promise.all([
    sb.from("categories").select("*").eq("active", true).order("name"),
    sb.from("centers").select("center_name").eq("id", session!.user.centerId!).maybeSingle(),
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add a new student</CardTitle>
        <CardDescription>The roll number is generated automatically once you save.</CardDescription>
      </CardHeader>
      <CardContent>
        <StudentForm
          categories={(cats ?? []) as Category[]}
          centerName={(centre?.center_name as string) ?? "My Centre"}
          centerId={session!.user.centerId}
        />
      </CardContent>
    </Card>
  );
}

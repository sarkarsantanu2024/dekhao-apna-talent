"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StudentForm } from "@/components/forms/student-form";
import { StudentBulkUpload } from "@/components/forms/student-bulk-upload";
import { useCategories, useCenters } from "@/services";

export default function NewStudentPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { data: categories, loading: catsLoading } = useCategories();
  const { data: centers, loading: centersLoading } = useCenters();

  /**
   * Pick the centre this user is logged into — resolved from the session's
   * pinned centerId, falling back to the first centre only if none is set.
   */
  const sessionCenterId = session?.user?.centerId ?? null;
  const myCenter = useMemo(
    () => centers.find((c) => c.id === sessionCenterId) ?? centers[0] ?? null,
    [centers, sessionCenterId],
  );

  if (catsLoading || centersLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }
  if (!myCenter) {
    return <p className="text-sm text-muted-foreground">No centre available. Add one in the admin panel first.</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add a new student</CardTitle>
        <CardDescription>The roll number is generated automatically once you save.</CardDescription>
      </CardHeader>
      <CardContent>
        <StudentBulkUpload
          categories={categories.filter((c) => c.active)}
          centerName={myCenter.center_name}
          centerId={myCenter.id}
          centerCity={myCenter.city}
          centerState={myCenter.state}
          centerPincode={myCenter.pincode}
          onDone={() => router.push("/center/students")}
        />
        <div className="relative my-2 flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">or add manually</span>
          <span className="h-px flex-1 bg-border" />
        </div>
        <StudentForm
          categories={categories.filter((c) => c.active)}
          centerName={myCenter.center_name}
          centerId={myCenter.id}
          centerCity={myCenter.city}
          centerState={myCenter.state}
          centerPincode={myCenter.pincode}
        />
      </CardContent>
    </Card>
  );
}

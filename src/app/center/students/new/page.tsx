"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StudentForm } from "@/components/forms/student-form";
import { useCategories, useCenters } from "@/services";

export default function NewStudentPage() {
  const { data: categories, loading: catsLoading } = useCategories();
  const { data: centers, loading: centersLoading } = useCenters();

  /**
   * Pick the centre this user is logged into. In demo mode the auth session's
   * centerId is pinned to the seeded Demo Centre — but if a custom centre
   * exists we still prefer the first one as a sensible fallback.
   */
  const myCenter = useMemo(() => centers[0] ?? null, [centers]);

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

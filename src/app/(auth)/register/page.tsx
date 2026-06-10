import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AuthTabs } from "@/components/forms/auth-tabs";

export const metadata = { title: "Login / Register" };

export default function RegisterPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Welcome</CardTitle>
        <CardDescription>Register a centre, or sign in to the Admin / Centre portal.</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={null}><AuthTabs defaultTab="register" /></Suspense>
      </CardContent>
    </Card>
  );
}

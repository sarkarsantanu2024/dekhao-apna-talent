import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AuthTabs } from "@/components/forms/auth-tabs";

export const metadata = { title: "Login / Register" };

export default function LoginPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Welcome</CardTitle>
        <CardDescription>Sign in to the Admin / Centre portal, or register a centre.</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={null}><AuthTabs defaultTab="login" /></Suspense>
      </CardContent>
    </Card>
  );
}

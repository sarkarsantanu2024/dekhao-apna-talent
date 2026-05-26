import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LoginForm } from "@/components/forms/login-form";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Centre owners and admins — use your registered email.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Suspense fallback={null}><LoginForm /></Suspense>
        <p className="text-center text-sm text-muted-foreground">
          New centre? <Link href="/register" className="font-medium text-primary hover:underline">Register here</Link>
        </p>
        <p className="text-center text-xs text-muted-foreground">
          <Link href="/forgot-password" className="hover:underline">Forgot password?</Link>
        </p>
      </CardContent>
    </Card>
  );
}

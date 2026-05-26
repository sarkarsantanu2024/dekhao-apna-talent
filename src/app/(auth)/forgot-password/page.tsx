import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Forgot password?</CardTitle>
        <CardDescription>Contact the platform admin to reset your password.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>Self-service password reset is on the roadmap.</p>
        <p>For now, please email <a href="mailto:admin@dekhaoapnatalent.com" className="text-primary hover:underline">admin@dekhaoapnatalent.com</a> from your registered address with the centre name.</p>
      </CardContent>
    </Card>
  );
}

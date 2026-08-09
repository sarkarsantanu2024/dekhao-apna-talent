import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DEVELOPER } from "@/constants";

export const metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  const waHref = `https://wa.me/${DEVELOPER.whatsapp}?text=${encodeURIComponent(
    "Hello, I need help resetting my Dekhao Apna Talent login.",
  )}`;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Forgot password?</CardTitle>
        <CardDescription>Your login can be re-issued for you.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p>
          <strong className="text-foreground">Centre owners:</strong> contact your platform
          admin — they can re-send your User ID and password from the Credentials page.
        </p>
        <p>
          <strong className="text-foreground">Admins:</strong> reach technical support at{" "}
          <a href={waHref} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            WhatsApp {DEVELOPER.phone}
          </a>{" "}
          or{" "}
          <a href={`tel:${DEVELOPER.tel}`} className="text-primary hover:underline">
            call {DEVELOPER.phone}
          </a>
          .
        </p>
      </CardContent>
    </Card>
  );
}

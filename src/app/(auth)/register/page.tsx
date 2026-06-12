import { redirect } from "next/navigation";

// Self-registration is hidden for now — centre logins are issued by the admin.
// Redirect any /register visit to the sign-in page.
export default function RegisterPage() {
  redirect("/login");
}

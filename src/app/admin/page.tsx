import { redirect } from "next/navigation";

// /admin -> /admin/dashboard (middleware sends unauthenticated users to /login).
export default function AdminIndex() {
  redirect("/admin/dashboard");
}

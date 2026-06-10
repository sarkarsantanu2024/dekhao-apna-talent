import { redirect } from "next/navigation";

// /center -> /center/dashboard (middleware sends unauthenticated users to /login).
export default function CenterIndex() {
  redirect("/center/dashboard");
}

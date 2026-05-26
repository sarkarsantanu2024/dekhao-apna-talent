import { signOut } from "@/lib/auth/auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function DashboardTopbar({ user }: { user: { name?: string | null; email?: string | null; role: string } }) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <div>
        <p className="text-sm text-muted-foreground">Signed in as</p>
        <p className="text-sm font-medium">{user.name ?? user.email} · {user.role === "admin" ? "Admin" : "Centre Owner"}</p>
      </div>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      >
        <Button variant="outline" size="sm" type="submit">
          <LogOut className="size-4" /> Sign out
        </Button>
      </form>
    </header>
  );
}

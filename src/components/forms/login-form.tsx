"use client";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ShieldCheck, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

const ADMIN_EMAIL = "admin@dekhaoapnatalent.com";

// The two fixed portal accounts. Replace with Supabase auth later.
const ACCOUNTS = [
  { role: "Admin", email: ADMIN_EMAIL, password: "Admin@123", icon: ShieldCheck },
  { role: "Centre Owner", email: "centre@dekhaoapnatalent.com", password: "Centre@123", icon: Building2 },
] as const;

function targetFor(email: string, from: string | null): string {
  if (from && from.startsWith("/")) return from;
  return email.trim().toLowerCase() === ADMIN_EMAIL ? "/admin/dashboard" : "/center/dashboard";
}

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const form = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  const doLogin = (values: LoginInput) =>
    start(async () => {
      setErr(null);
      const res = await signIn("credentials", { ...values, redirect: false });
      if (res?.error) {
        setErr("Invalid email or password.");
        toast.error("Login failed");
        return;
      }
      toast.success("Welcome back!");
      router.push(targetFor(values.email, search.get("from")));
      router.refresh();
    });

  return (
    <div className="space-y-5">
      <form onSubmit={form.handleSubmit(doLogin)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
          {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="current-password" {...form.register("password")} />
          {form.formState.errors.password && <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>}
        </div>
        {err && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{err}</p>}
        <Button type="submit" className="w-full" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</Button>
      </form>

      <div className="grid gap-2">
        {ACCOUNTS.map((a) => (
          <button
            key={a.email}
            type="button"
            disabled={pending}
            onClick={() => doLogin({ email: a.email, password: a.password })}
            className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
          >
            <a.icon className="size-4 text-primary" />
            <span className="font-medium">Sign in as {a.role}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

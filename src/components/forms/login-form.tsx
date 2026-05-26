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

const DEMOS = [
  { role: "Admin",         email: "admin@dekhaoapnatalent.com",  password: "Admin@123",  icon: ShieldCheck },
  { role: "Centre Owner",  email: "centre@dekhaoapnatalent.com", password: "Centre@123", icon: Building2 },
] as const;

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const form = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  const fill = (email: string, password: string) => {
    form.setValue("email", email, { shouldValidate: true });
    form.setValue("password", password, { shouldValidate: true });
  };

  const onSubmit = (values: LoginInput) =>
    start(async () => {
      setErr(null);
      const res = await signIn("credentials", { ...values, redirect: false });
      if (res?.error) {
        setErr("Invalid email or password. Make sure supabase/seed.sql has been run.");
        toast.error("Login failed");
        return;
      }
      toast.success("Welcome back!");
      router.push(search.get("from") ?? "/center/dashboard");
      router.refresh();
    });

  return (
    <div className="space-y-5">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

      <div className="rounded-md border border-dashed bg-muted/40 p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Demo credentials</p>
        <div className="grid gap-2">
          {DEMOS.map((d) => (
            <button
              key={d.email}
              type="button"
              onClick={() => fill(d.email, d.password)}
              className="flex items-center justify-between rounded-md border bg-background px-3 py-2 text-left text-xs transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <span className="flex items-center gap-2">
                <d.icon className="size-4 text-primary" />
                <span className="font-medium">{d.role}</span>
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">
                {d.email} · {d.password}
              </span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Click a row to autofill, then press Sign in. Accounts come from <code>supabase/seed.sql</code>.
        </p>
      </div>
    </div>
  );
}

"use client";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

// Admin user IDs route to the admin dashboard; everyone else to the centre side.
const ADMIN_IDS = new Set<string>(["pintu.gupta", "santanu.sarkar"]);

function targetFor(userId: string, from: string | null): string {
  if (from && from.startsWith("/")) return from;
  return ADMIN_IDS.has(userId.trim().toLowerCase()) ? "/admin/dashboard" : "/center/dashboard";
}

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const form = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { userId: "", password: "" } });

  const doLogin = (values: LoginInput) =>
    start(async () => {
      setErr(null);
      const res = await signIn("credentials", { ...values, redirect: false });
      if (res?.error) {
        setErr("Invalid user ID or password.");
        toast.error("Login failed");
        return;
      }
      toast.success("Welcome back!");
      router.push(targetFor(values.userId, search.get("from")));
      router.refresh();
    });

  return (
    <div className="space-y-5">
      <form onSubmit={form.handleSubmit(doLogin)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="userId" className="text-white/70">User ID</Label>
          <Input
            id="userId"
            autoComplete="username"
            placeholder="e.g. pintu.gupta"
            className="border-white/15 bg-white/5 text-white placeholder:text-white/40 focus-visible:ring-fuchsia-400/50"
            {...form.register("userId")}
          />
          {form.formState.errors.userId && <p className="text-xs text-rose-300">{form.formState.errors.userId.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-white/70">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            className="border-white/15 bg-white/5 text-white placeholder:text-white/40 focus-visible:ring-fuchsia-400/50"
            {...form.register("password")}
          />
          {form.formState.errors.password && <p className="text-xs text-rose-300">{form.formState.errors.password.message}</p>}
        </div>
        {err && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{err}</p>}
        <Button type="submit" className="w-full" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</Button>
      </form>
    </div>
  );
}

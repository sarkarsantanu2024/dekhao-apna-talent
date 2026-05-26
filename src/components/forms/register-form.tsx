"use client";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";

export function RegisterForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const form = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = (values: RegisterInput) =>
    start(async () => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error ?? "Registration failed"); return; }
      await signIn("credentials", { email: values.email, password: values.password, redirect: false });
      toast.success("Centre registered!");
      router.push("/center/dashboard");
      router.refresh();
    });

  const e = form.formState.errors;
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label="Centre name *" err={e.center_name?.message}><Input {...form.register("center_name")} /></Field>
      <Field label="Owner name *" err={e.name?.message}><Input {...form.register("name")} /></Field>
      <Field label="Email *" err={e.email?.message}><Input type="email" {...form.register("email")} /></Field>
      <Field label="Phone" err={e.phone?.message}><Input {...form.register("phone")} /></Field>
      <Field label="Password *" err={e.password?.message}><Input type="password" {...form.register("password")} /></Field>
      <Field label="City *" err={e.city?.message}><Input {...form.register("city")} /></Field>
      <Field label="State *" err={e.state?.message}><Input {...form.register("state")} /></Field>
      <Field label="Pincode *" err={e.pincode?.message}><Input {...form.register("pincode")} /></Field>
      <div className="sm:col-span-2">
        <Field label="Address" err={e.address?.message}><Textarea rows={2} {...form.register("address")} /></Field>
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" className="w-full" disabled={pending}>{pending ? "Creating…" : "Create centre account"}</Button>
      </div>
    </form>
  );
}

function Field({ label, err, children }: { label: string; err?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {err && <p className="text-xs text-destructive">{err}</p>}
    </div>
  );
}

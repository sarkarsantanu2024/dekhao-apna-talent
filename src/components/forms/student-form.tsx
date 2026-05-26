"use client";
import { useTransition } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { studentSchema, type StudentInput } from "@/lib/validations/student";
import type { Category } from "@/types";
import { calcAge } from "@/lib/utils";

export function StudentForm({
  categories, centerName, centerId,
}: { categories: Category[]; centerName: string; centerId: string | null }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const form = useForm<StudentInput>({
    resolver: zodResolver(studentSchema) as unknown as Resolver<StudentInput>,
    defaultValues: { center_name: centerName, center_id: centerId ?? undefined, age: 6 },
  });

  const onPhoto = async (file: File): Promise<string | null> => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("bucket", "student-photos");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) { toast.error("Photo upload failed"); return null; }
    const json = await res.json();
    return json.url as string;
  };

  const onSubmit = (values: StudentInput) =>
    start(async () => {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error ?? "Could not save student"); return; }
      toast.success(`Student saved — roll ${json.student.roll_number}`);
      router.push("/center/students");
      router.refresh();
    });

  const e = form.formState.errors;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Field label="Full name *" err={e.full_name?.message}><Input {...form.register("full_name")} /></Field>
      <Field label="Guardian name *" err={e.guardian_name?.message}><Input {...form.register("guardian_name")} /></Field>

      <Field label="Date of birth *" err={e.dob?.message}>
        <Input type="date" {...form.register("dob", {
          onChange: (ev) => form.setValue("age", calcAge(ev.target.value)),
        })} />
      </Field>
      <Field label="Age (6–14) *" err={e.age?.message}><Input type="number" min={6} max={14} {...form.register("age")} /></Field>

      <Field label="Class" err={e.class?.message}><Input {...form.register("class")} /></Field>
      <Field label="School" err={e.school_name?.message}><Input {...form.register("school_name")} /></Field>

      <Field label="Category *" err={e.category_name?.message}>
        <Select onValueChange={(slugOrId) => {
          const c = categories.find((x) => x.id === slugOrId);
          if (!c) return;
          form.setValue("category_id", c.id);
          form.setValue("category_name", c.name);
        }}>
          <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
          <SelectContent>
            {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Centre name *" err={e.center_name?.message}><Input {...form.register("center_name")} readOnly /></Field>

      <Field label="Phone" err={e.phone?.message}><Input {...form.register("phone")} /></Field>
      <Field label="WhatsApp" err={e.whatsapp?.message}><Input {...form.register("whatsapp")} /></Field>

      <Field label="City" err={e.city?.message}><Input {...form.register("city")} /></Field>
      <Field label="State" err={e.state?.message}><Input {...form.register("state")} /></Field>
      <Field label="Pincode" err={e.pincode?.message}><Input {...form.register("pincode")} /></Field>

      <Field label="Photo">
        <Input type="file" accept="image/*" onChange={async (ev) => {
          const f = ev.target.files?.[0];
          if (!f) return;
          if (f.size > 3 * 1024 * 1024) { toast.error("Max 3 MB"); return; }
          const url = await onPhoto(f);
          if (url) { form.setValue("photo_url", url); toast.success("Photo uploaded"); }
        }} />
      </Field>

      <div className="md:col-span-2">
        <Field label="Address" err={e.address?.message}><Textarea rows={2} {...form.register("address")} /></Field>
      </div>
      <div className="md:col-span-2">
        <Field label="Performance topic" err={e.performance_topic?.message}><Input {...form.register("performance_topic")} /></Field>
      </div>
      <div className="md:col-span-2">
        <Field label="Performance details" err={e.performance_details?.message}><Textarea rows={3} {...form.register("performance_details")} /></Field>
      </div>

      <div className="md:col-span-2 flex justify-end">
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save student"}</Button>
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

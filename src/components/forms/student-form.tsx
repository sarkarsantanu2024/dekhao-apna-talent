"use client";

import { useRef, useTransition } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  User,
  Users,
  Calendar,
  Hash,
  GraduationCap,
  School,
  Sparkles,
  Building2,
  Phone,
  MessageCircle,
  MapPin,
  Map,
  Mailbox,
  Image as ImageIcon,
  FileText,
  StickyNote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { studentSchema, type StudentInput } from "@/lib/validations/student";
import type { Category } from "@/types";
import { calcAge, cn } from "@/lib/utils";
import { store } from "@/services";
import { studentKey } from "@/components/forms/student-bulk-upload";

type Props = {
  categories: Category[];
  centerName: string;
  centerId: string | null;
  centerCity?: string | null;
  centerState?: string | null;
  centerPincode?: string | null;
};

export function StudentForm({
  categories,
  centerName,
  centerId,
  centerCity,
  centerState,
  centerPincode,
}: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const form = useForm<StudentInput>({
    resolver: zodResolver(studentSchema) as unknown as Resolver<StudentInput>,
    defaultValues: {
      center_name: centerName,
      center_id: centerId ?? undefined,
      age: 6,
      city: centerCity ?? "",
      state: centerState ?? "",
      pincode: centerPincode ?? "",
    },
  });

  // Click anywhere on the DOB Field → open the native calendar.
  const dobRef = useRef<HTMLInputElement | null>(null);
  const openCalendar = () => {
    const el = dobRef.current as (HTMLInputElement & { showPicker?: () => void }) | null;
    if (!el) return;
    if (typeof el.showPicker === "function") el.showPicker();
    else el.focus();
  };

  const onPhoto = (file: File): Promise<string | null> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });

  const onSubmit = (values: StudentInput) =>
    start(async () => {
      try {
        if (!values.category_id) {
          toast.error("Please pick a category");
          return;
        }
        if (!values.photo_url) {
          toast.error("Student photo is required");
          return;
        }
        const existing = await store.listStudents(centerId ? { centerId } : undefined);
        const candidate = { full_name: values.full_name, dob: values.dob, phone: values.phone };
        if (existing.some((s) => studentKey(s) === studentKey(candidate))) {
          toast.error("A student with the same name, date of birth and phone already exists");
          return;
        }
        const created = await store.createStudent({
          full_name: values.full_name,
          guardian_name: values.guardian_name,
          dob: values.dob,
          age: Number(values.age),
          class: values.class,
          school_name: values.school_name,
          category_id: values.category_id,
          category_name: values.category_name,
          center_id: values.center_id ?? centerId,
          center_name: values.center_name,
          phone: values.phone,
          whatsapp: values.whatsapp,
          address: values.address,
          city: values.city ?? null,
          state: values.state ?? null,
          pincode: values.pincode ?? null,
          photo_url: values.photo_url ?? null,
          performance_topic: values.performance_topic ?? null,
          performance_details: values.performance_details ?? null,
          created_by: null,
        });
        await store.logEvent({
          type: "students_added",
          audience: "admin",
          message: `added student ${created.full_name}`,
          center_id: values.center_id ?? centerId,
          center_name: values.center_name,
        });
        toast.success(`Student saved — roll ${created.roll_number}`);
        router.push("/center/students");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not save student");
      }
    });

  const onInvalid = (errors: Record<string, { message?: string } | undefined>) => {
    const firstMsg = Object.values(errors).find((e) => e?.message)?.message;
    toast.error(firstMsg ?? "Please correct the highlighted fields");
  };

  const e = form.formState.errors;

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit, onInvalid)}
      className="grid grid-cols-1 gap-4 md:grid-cols-2"
    >
      <Field label="Full name" icon={User} required err={e.full_name?.message}>
        <Input {...form.register("full_name")} placeholder="Aarav Sharma" />
      </Field>
      <Field label="Guardian name" icon={Users} required err={e.guardian_name?.message}>
        <Input {...form.register("guardian_name")} placeholder="Father / Mother / Guardian" />
      </Field>

      <Field label="Date of birth" icon={Calendar} required err={e.dob?.message}>
        <div className="relative">
          <Input
            type="date"
            {...form.register("dob", {
              onChange: (ev) => {
                const next = calcAge(ev.target.value);
                if (Number.isFinite(next)) form.setValue("age", next, { shouldValidate: true });
              },
            })}
            ref={(el) => {
              dobRef.current = el;
              form.register("dob").ref(el);
            }}
            className="pr-10"
          />
          <button
            type="button"
            aria-label="Open calendar"
            onClick={openCalendar}
            className="absolute right-2 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Calendar className="size-4" />
          </button>
        </div>
      </Field>
      <Field label="Age" icon={Hash} required err={e.age?.message} hint="Auto-fills from date of birth — readable & editable">
        <Input type="number" min={6} max={14} {...form.register("age")} />
      </Field>

      <Field label="Class" icon={GraduationCap} required err={e.class?.message}>
        <Input {...form.register("class")} placeholder="e.g. Class 5" />
      </Field>
      <Field label="School" icon={School} required err={e.school_name?.message}>
        <Input {...form.register("school_name")} placeholder="School / institution name" />
      </Field>

      <Field
        label="Category"
        icon={Sparkles}
        required
        err={e.category_id?.message ?? e.category_name?.message}
      >
        <Select
          value={form.watch("category_id") ?? ""}
          onValueChange={(id) => {
            const c = categories.find((x) => x.id === id);
            if (!c) return;
            form.setValue("category_id", c.id, { shouldValidate: true });
            form.setValue("category_name", c.name, { shouldValidate: true });
          }}
        >
          <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
          <SelectContent>
            {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Centre name" icon={Building2} required err={e.center_name?.message}>
        <Input {...form.register("center_name")} readOnly />
      </Field>

      <Field label="Phone" icon={Phone} required err={e.phone?.message}>
        <Input {...form.register("phone")} placeholder="+91 …" />
      </Field>
      <Field label="WhatsApp" icon={MessageCircle} required err={e.whatsapp?.message}>
        <Input {...form.register("whatsapp")} placeholder="+91 …" />
      </Field>

      <Field label="City" icon={MapPin} err={e.city?.message}>
        <Input {...form.register("city")} />
      </Field>
      <Field label="State" icon={Map} err={e.state?.message}>
        <Input {...form.register("state")} />
      </Field>
      <Field label="Pincode" icon={Mailbox} err={e.pincode?.message}>
        <Input {...form.register("pincode")} />
      </Field>

      <Field label="Photo" icon={ImageIcon} required>
        <FileUpload
          accept="image/*"
          previewUrl={form.watch("photo_url") || null}
          fileName={form.watch("photo_url") ? "Photo attached" : null}
          hint="JPG or PNG, max 3 MB"
          onFile={async (f) => {
            if (!f) return form.setValue("photo_url", "");
            if (f.size > 3 * 1024 * 1024) { toast.error("Max 3 MB"); return; }
            const url = await onPhoto(f);
            if (url) { form.setValue("photo_url", url); toast.success("Photo attached"); }
          }}
        />
      </Field>

      <div className="md:col-span-2">
        <Field label="Address" icon={MapPin} required err={e.address?.message}>
          <Textarea rows={2} {...form.register("address")} placeholder="House no., street, area" />
        </Field>
      </div>

      <div className="md:col-span-2">
        <Field
          label="Performance topic"
          icon={StickyNote}
          err={e.performance_topic?.message}
          hint="Short title — e.g. “Bharatanatyam · Mallari” or “Rabindrasangeet · Phule phule”. Helps judges identify the act on stage."
        >
          <Input {...form.register("performance_topic")} placeholder="What will the student perform?" />
        </Field>
      </div>
      <div className="md:col-span-2">
        <Field
          label="Performance details"
          icon={FileText}
          err={e.performance_details?.message}
          hint="2–3 lines — props needed, accompanying music track, special requirements, duration. The judges' coordinator reads this before the act."
        >
          <Textarea rows={3} {...form.register("performance_details")} />
        </Field>
      </div>

      <div className="md:col-span-2 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save student"}</Button>
      </div>
    </form>
  );
}

/* ---------------- Field shell ---------------- */

type Icon = React.ComponentType<{ className?: string }>;

function Field({
  label,
  icon: Icon,
  required = false,
  err,
  hint,
  children,
}: {
  label: string;
  icon: Icon;
  required?: boolean;
  err?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className={cn("flex items-center gap-2 text-xs", err && "text-destructive")}>
        <Icon className="size-3.5 text-muted-foreground" />
        <span>
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </span>
      </Label>
      {children}
      {hint && !err && <p className="text-[11px] leading-tight text-muted-foreground">{hint}</p>}
      {err && <p className="text-xs text-destructive">{err}</p>}
    </div>
  );
}

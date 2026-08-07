import { Lock, ImageOff, Clock, XCircle, Upload } from "lucide-react";
import { isDownloadable, hasPhoto } from "@/lib/pdf/generate-chest-card";
import type { Payment, Student } from "@/types";

type Blocker = {
  key: string;
  label: string;
  icon: typeof Lock;
  /** tailwind classes for the chip */
  tone: string;
  /** extra explanation — the admin's rejection note, shown under the chip */
  hint?: string;
};

const AMBER = "bg-amber-100 text-amber-700";
const ROSE = "bg-rose-100 text-rose-700";
const SLATE = "bg-slate-100 text-slate-700";

/** The student's most recent payment, if any. */
function latestPayment(studentId: string, payments: Payment[]): Payment | null {
  let latest: Payment | null = null;
  for (const p of payments) {
    if (p.student_id !== studentId) continue;
    if (!latest || p.created_at > latest.created_at) latest = p;
  }
  return latest;
}

/**
 * Every reason this student's chest card is still locked — not just the first
 * one. A student with neither payment nor photo used to see only the payment
 * chip, then get ambushed by "Photo required" once the payment cleared.
 */
export function chestCardBlockers(s: Student, payments: Payment[]): Blocker[] {
  const out: Blocker[] = [];

  if (!isDownloadable(s)) {
    const p = latestPayment(s.id, payments);
    if (!p) {
      out.push({ key: "pay", label: "Payment not uploaded", icon: Upload, tone: SLATE });
    } else if (p.status === "pending") {
      out.push({ key: "pay", label: "Awaiting payment approval", icon: Clock, tone: AMBER });
    } else if (p.status === "rejected") {
      out.push({
        key: "pay",
        label: "Payment rejected",
        icon: XCircle,
        tone: ROSE,
        hint: p.review_note ?? "Re-upload the screenshot from Payments → Resubmit",
      });
    } else {
      // Payment is approved but the student was never activated — rare, but
      // don't claim the payment is missing.
      out.push({ key: "pay", label: "Activation pending", icon: Lock, tone: AMBER });
    }
  }

  if (!hasPhoto(s)) {
    out.push({ key: "photo", label: "Photo required", icon: ImageOff, tone: ROSE });
  }

  return out;
}

export function ChestCardBlockers({ blockers }: { blockers: Blocker[] }) {
  return (
    <span className="inline-flex flex-col items-end gap-1">
      <span className="inline-flex flex-wrap items-center justify-end gap-1.5">
        {blockers.map(({ key, label, icon: Icon, tone }) => (
          <span
            key={key}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}
          >
            <Icon className="size-3.5" /> {label}
          </span>
        ))}
      </span>
      {blockers.filter((b) => b.hint).map((b) => (
        <span key={`${b.key}-hint`} className="max-w-64 text-right text-[11px] text-muted-foreground">
          “{b.hint}”
        </span>
      ))}
    </span>
  );
}

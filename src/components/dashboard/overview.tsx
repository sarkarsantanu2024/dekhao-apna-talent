"use client";

import Link from "next/link";
import {
  Users,
  Building2,
  IndianRupee,
  FileCheck2,
  CreditCard,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/cards/stat-card";
import { formatCurrency } from "@/lib/utils";
import type { DashboardStats } from "@/services";

/**
 * Shared dashboard body used by both admin and centre owner so the surfaced
 * numbers (and their meaning) are identical — just scoped differently. The
 * caller assembles the stats; this component just renders.
 */
type Props = {
  stats: DashboardStats;
  /** "global" hides per-centre framing; "centre" hides admin-only widgets. */
  scope: "global" | "centre";
  /** Hide the "Centres" tile when scoped to a single centre. */
  showCentres?: boolean;
  /** Where each status chip should link to when clicked. */
  studentsHref: string;
  paymentsHref: string;
};

const STATUS_STYLES: Record<string, { bar: string; text: string }> = {
  pending:  { bar: "bg-amber-500",  text: "text-amber-600" },
  approved: { bar: "bg-emerald-500", text: "text-emerald-600" },
  rejected: { bar: "bg-rose-500",   text: "text-rose-600" },
  active:   { bar: "bg-sky-500",    text: "text-sky-600" },
};

export function DashboardOverview({
  stats,
  scope,
  showCentres = scope === "global",
  studentsHref,
  paymentsHref,
}: Props) {
  return (
    <div className="space-y-6">
      {/* Top-line numbers */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={scope === "global" ? "Total students" : "My students"} value={stats.students} icon={Users} />
        {showCentres
          ? <StatCard label="Total centres" value={stats.centers} icon={Building2} />
          : <StatCard label="Active chest cards" value={stats.activeStudents} icon={FileCheck2} />}
        <StatCard label="Collected (approved)" value={formatCurrency(stats.collected)} icon={IndianRupee} />
        {/* Students registered but whose payment isn't approved yet (= still "approved", not "active"). */}
        <StatCard label="Payment pending" value={stats.approvedStudents} icon={CreditCard} />
      </div>
      <p className="-mt-2 text-xs text-muted-foreground">
        “Payment pending” = students awaiting payment approval. “Active” = students whose payment is approved (chest card unlocked).
      </p>

      {/* Student status breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Student status</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatusChip href={`${studentsHref}?filter=pending`}  label="Pending"  value={stats.pendingStudents}  variant="pending"  total={stats.students} />
          <StatusChip href={`${studentsHref}?filter=approved`} label="Approved" value={stats.approvedStudents} variant="approved" total={stats.students} />
          <StatusChip href={`${studentsHref}?filter=rejected`} label="Rejected" value={stats.rejectedStudents} variant="rejected" total={stats.students} />
          <StatusChip href={`${studentsHref}?filter=active`}   label="Active"   value={stats.activeStudents}   variant="active"   total={stats.students} />
        </CardContent>
      </Card>

      {/* Payment status breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Payments</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <StatusChip href={`${paymentsHref}?filter=pending`}  label="Pending"  value={stats.pendingPayments}  variant="pending"  />
          <StatusChip href={`${paymentsHref}?filter=approved`} label="Approved" value={stats.approvedPayments} variant="approved" />
          <StatusChip href={`${paymentsHref}?filter=rejected`} label="Rejected" value={stats.rejectedPayments} variant="rejected" />
        </CardContent>
      </Card>

      {/* By-category breakdown — meaningful in both scopes */}
      <Card>
        <CardHeader>
          <CardTitle>Students by category</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.byCategory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No students yet.</p>
          ) : (
            <ul className="divide-y">
              {stats.byCategory.map((row) => (
                <li key={row.categoryName} className="flex justify-between py-2 text-sm">
                  <span>{row.categoryName}</span>
                  <span className="font-semibold">{row.count}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusChip({
  href,
  label,
  value,
  variant,
  total,
}: {
  href: string;
  label: string;
  value: number;
  variant: keyof typeof STATUS_STYLES;
  total?: number;
}) {
  const s = STATUS_STYLES[variant];
  const pct = total && total > 0 ? Math.round((value / total) * 100) : null;
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/40"
    >
      <span className={`block size-2.5 shrink-0 rounded-full ${s.bar}`} />
      <div className="flex flex-1 items-baseline justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className={`text-2xl font-bold ${s.text}`}>{value}</p>
        </div>
        {pct !== null && (
          <span className="text-[11px] text-muted-foreground">{pct}%</span>
        )}
      </div>
    </Link>
  );
}

/* Re-export so consumers don't double-import. */
export type { LucideIcon };

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, CreditCard, UserCheck, AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStats, useStudents, usePayments, useCenters } from "@/services";
import { formatDate } from "@/lib/utils";

type Role = "admin" | "center_owner";

type NotificationItem = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  text: React.ReactNode;
  href: string;
  date?: string;
  tone: "info" | "warn" | "ok";
};

/**
 * Notification bell. Derives the list from current store state so we don't
 * need a separate notifications table. For demo this is plenty — when wired
 * to Supabase Realtime later, swap the data source inside `useNotifications`.
 */
export function NotificationBell({ role }: { role: Role }) {
  const items = useNotifications(role);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const unread = items.length;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={`Notifications (${unread} new)`}
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex size-9 items-center justify-center rounded-full border hover:bg-accent"
      >
        <Bell className="size-4" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-destructive-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-lg">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <p className="text-sm font-semibold">Notifications</p>
            <span className="text-[11px] text-muted-foreground">{unread} new</span>
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-muted-foreground">All caught up. 🎉</li>
            ) : items.map((n) => (
              <li key={n.id}>
                <Link
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-3 border-b px-4 py-3 last:border-b-0 hover:bg-muted/60"
                >
                  <span
                    className={`mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full ${
                      n.tone === "warn"
                        ? "bg-amber-100 text-amber-700"
                        : n.tone === "ok"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-sky-100 text-sky-700"
                    }`}
                  >
                    <n.icon className="size-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug">{n.text}</p>
                    {n.date && <p className="mt-0.5 text-[11px] text-muted-foreground">{formatDate(n.date)}</p>}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          {items.length > 0 && (
            <div className="border-t bg-muted/40 px-4 py-2 text-center">
              <Link href={role === "admin" ? "/admin/dashboard" : "/center/dashboard"} className="text-xs font-medium text-primary hover:underline">
                Go to dashboard
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- derivation logic ---------- */

function useNotifications(role: Role): NotificationItem[] {
  const { data: stats } = useStats();
  const { data: centers } = useCenters();
  const centerId = centers[0]?.id;

  // For centre, scope the queries
  const { data: myStudents } = useStudents(role === "center_owner" && centerId ? { centerId } : undefined);
  const { data: myPayments } = usePayments(role === "center_owner" && centerId ? { centerId } : undefined);

  return useMemo<NotificationItem[]>(() => {
    if (role === "admin") {
      const items: NotificationItem[] = [];
      if (stats.pendingStudents > 0) {
        items.push({
          id: "n-pending-students",
          icon: UserCheck,
          text: <><strong>{stats.pendingStudents}</strong> student{stats.pendingStudents === 1 ? "" : "s"} waiting for approval</>,
          href: "/admin/students?filter=pending",
          tone: "warn",
        });
      }
      if (stats.pendingPayments > 0) {
        items.push({
          id: "n-pending-payments",
          icon: CreditCard,
          text: <><strong>{stats.pendingPayments}</strong> payment{stats.pendingPayments === 1 ? "" : "s"} pending verification</>,
          href: "/admin/payments",
          tone: "warn",
        });
      }
      if (stats.activeStudents > 0) {
        items.push({
          id: "n-active-students",
          icon: CheckCheck,
          text: <><strong>{stats.activeStudents}</strong> chest card{stats.activeStudents === 1 ? "" : "s"} issued so far</>,
          href: "/admin/students?filter=active",
          tone: "ok",
        });
      }
      return items;
    }

    // Centre owner
    const items: NotificationItem[] = [];
    const rejStudents = myStudents.filter((s) => s.status === "rejected");
    const rejPayments = myPayments.filter((p) => p.status === "rejected");
    const pendingPayments = myPayments.filter((p) => p.status === "pending");
    const approvedReady = myStudents.filter((s) => s.status === "approved");

    if (rejPayments.length > 0) {
      items.push({
        id: "n-rej-payments",
        icon: AlertTriangle,
        text: <><strong>{rejPayments.length}</strong> payment{rejPayments.length === 1 ? "" : "s"} rejected — needs a fresh screenshot</>,
        href: "/center/payments",
        tone: "warn",
      });
    }
    if (rejStudents.length > 0) {
      items.push({
        id: "n-rej-students",
        icon: AlertTriangle,
        text: <><strong>{rejStudents.length}</strong> student{rejStudents.length === 1 ? "" : "s"} rejected by admin — edit & resubmit</>,
        href: "/center/students",
        tone: "warn",
      });
    }
    if (pendingPayments.length > 0) {
      items.push({
        id: "n-pending-payments-mine",
        icon: RotateCcw,
        text: <><strong>{pendingPayments.length}</strong> payment{pendingPayments.length === 1 ? "" : "s"} awaiting admin verification</>,
        href: "/center/payments",
        tone: "info",
      });
    }
    if (approvedReady.length > 0) {
      items.push({
        id: "n-ready-cards",
        icon: CheckCheck,
        text: <><strong>{approvedReady.length}</strong> chest card{approvedReady.length === 1 ? "" : "s"} ready to download</>,
        href: "/center/downloads",
        tone: "ok",
      });
    }
    return items;
  }, [role, stats, myStudents, myPayments]);
}

/* Re-export Bell so consumers don't need a second lucide import */
export { Bell };
export const NotificationButton = Button; // not used directly, prevents tree-shake of Button

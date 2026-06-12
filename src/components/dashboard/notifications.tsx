"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Bell, CheckCheck, CreditCard, AlertTriangle, RotateCcw, Users, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStats, useStudents, useEvents } from "@/services";
import { formatDate } from "@/lib/utils";
import type { ActivityEvent } from "@/types";

type Role = "admin" | "center_owner";

type NotificationItem = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  text: React.ReactNode;
  href: string;
  date?: string;
  tone: "info" | "warn" | "ok";
};

const SEEN_KEY = "dat:notif-seen";

/** Per-event-type presentation. Each type belongs to one audience/destination. */
const EVENT_META: Record<ActivityEvent["type"], { icon: NotificationItem["icon"]; href: string; tone: NotificationItem["tone"] }> = {
  students_added:      { icon: Users,         href: "/admin/students",  tone: "info" },
  payment_uploaded:    { icon: CreditCard,    href: "/admin/payments",  tone: "info" },
  payment_resubmitted: { icon: RotateCcw,     href: "/admin/payments",  tone: "info" },
  payment_approved:    { icon: Check,         href: "/center/downloads", tone: "ok" },
  payment_rejected:    { icon: X,             href: "/center/payments", tone: "warn" },
  payment_reverted:    { icon: RotateCcw,     href: "/center/payments", tone: "warn" },
  student_rejected:    { icon: AlertTriangle, href: "/center/students", tone: "warn" },
};

function eventToItem(e: ActivityEvent): NotificationItem {
  const meta = EVENT_META[e.type];
  return {
    id: e.id,
    icon: meta.icon,
    // Admin feed names the centre; centre feed reads as a complete sentence.
    text: e.audience === "admin"
      ? <><strong>{e.center_name ?? "A centre"}</strong> {e.message}</>
      : <>{e.message}</>,
    href: meta.href,
    date: e.created_at,
    tone: meta.tone,
  };
}

/**
 * Notification bell. Activity events drive the feed (centre actions → admin,
 * admin actions → the affected centre); a few live stats round it out.
 */
export function NotificationBell({ role }: { role: Role }) {
  const { data: allEvents } = useEvents();
  const { items, relevantEvents } = useNotifications(role, allEvents);
  const [open, setOpen] = useState(false);
  const [seenAt, setSeenAt] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") setSeenAt(window.localStorage.getItem(SEEN_KEY) ?? "");
  }, []);

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

  const unread = relevantEvents.filter((e) => e.created_at > seenAt).length;

  const markSeen = () => {
    const now = new Date().toISOString();
    setSeenAt(now);
    if (typeof window !== "undefined") window.localStorage.setItem(SEEN_KEY, now);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={`Notifications (${unread} new)`}
        onClick={() => setOpen((v) => { const next = !v; if (next) markSeen(); return next; })}
        className="relative inline-flex size-9 items-center justify-center rounded-full border hover:bg-accent"
      >
        <Bell className="size-4" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-destructive-foreground">
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

function useNotifications(role: Role, events: ActivityEvent[]): { items: NotificationItem[]; relevantEvents: ActivityEvent[] } {
  const { data: session } = useSession();
  const { data: stats } = useStats();
  const centerId = session?.user?.centerId ?? null;
  const { data: myStudents } = useStudents(role === "center_owner" && centerId ? { centerId } : undefined);

  return useMemo(() => {
    if (role === "admin") {
      const relevant = events.filter((e) => e.audience === "admin");
      const items: NotificationItem[] = relevant.slice(0, 20).map(eventToItem);
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
      return { items, relevantEvents: relevant };
    }

    // Centre owner — admin actions on this centre + a couple of live hints.
    const relevant = events.filter((e) => e.audience === "center" && e.center_id === centerId);
    const items: NotificationItem[] = relevant.slice(0, 20).map(eventToItem);
    const ready = myStudents.filter((s) => s.status === "active");
    if (ready.length > 0) {
      items.push({
        id: "n-ready-cards",
        icon: CheckCheck,
        text: <><strong>{ready.length}</strong> chest card{ready.length === 1 ? "" : "s"} ready to download</>,
        href: "/center/downloads",
        tone: "ok",
      });
    }
    return { items, relevantEvents: relevant };
  }, [role, events, stats, myStudents, centerId]);
}

/* Re-export Bell so consumers don't need a second lucide import */
export { Bell };
export const NotificationButton = Button; // not used directly, prevents tree-shake of Button

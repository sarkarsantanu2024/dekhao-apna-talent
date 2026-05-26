"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogOut, User, Settings } from "lucide-react";
import { signOut } from "next-auth/react";

type SessionUser = {
  name?: string | null;
  email?: string | null;
  role: string;
};

/**
 * Avatar chip in the topbar with a dropdown menu (account, settings, sign out).
 * Shows initials when no avatar image is supplied.
 */
export function ProfileMenu({ user }: { user: SessionUser }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const display = user.name?.trim() || user.email || "User";
  const initials = display
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
  const roleLabel = user.role === "admin" ? "Administrator" : "Centre Owner";

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

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border bg-card py-1 pl-1 pr-3 text-left transition-colors hover:bg-accent"
      >
        <span className="inline-flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {initials || "?"}
        </span>
        <span className="hidden min-w-0 sm:flex sm:flex-col sm:leading-tight">
          <span className="truncate text-sm font-medium">{display}</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{roleLabel}</span>
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-lg">
          <div className="border-b px-4 py-3">
            <p className="truncate text-sm font-medium">{display}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{roleLabel}</p>
          </div>
          <ul className="py-1 text-sm">
            <li>
              <Link
                href={user.role === "admin" ? "/admin/dashboard" : "/center/dashboard"}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2 hover:bg-muted"
              >
                <User className="size-4" /> My profile
              </Link>
            </li>
            <li>
              <Link
                href={user.role === "admin" ? "/admin/categories" : "/center/dashboard"}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2 hover:bg-muted"
              >
                <Settings className="size-4" /> Settings
              </Link>
            </li>
          </ul>
          <div className="border-t">
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
            >
              <LogOut className="size-4" /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

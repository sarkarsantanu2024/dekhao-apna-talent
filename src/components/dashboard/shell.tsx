"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Star, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationBell } from "./notifications";
import { ProfileMenu } from "./profile-menu";

export interface NavItem { href: string; label: string }

type SessionUser = { name?: string | null; email?: string | null; role: string };

type Props = {
  nav: NavItem[];
  title: string;
  user: SessionUser;
  children: React.ReactNode;
};

const COLLAPSED_KEY = "dat:sidebar-collapsed";

/** Sidebar palette — hardcoded so it stays dark navy while the rest of the
 * dashboard runs on the light theme. Easier to read than overriding tokens
 * in two scopes. */
const SIDEBAR_BG          = "bg-[#1f2138]";
const SIDEBAR_BORDER      = "border-white/10";
const SIDEBAR_TEXT        = "text-white/85";
const SIDEBAR_TEXT_DIM    = "text-white/55";
const SIDEBAR_HOVER       = "hover:bg-white/5 hover:text-white";
const SIDEBAR_ACTIVE      = "bg-[#2a2d4a] text-white";
const SIDEBAR_ACTIVE_BAR  = "before:absolute before:inset-y-1 before:left-0 before:w-1 before:rounded-r before:bg-primary";

export function DashboardShell({ nav, title, user, children }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(COLLAPSED_KEY) === "1") setCollapsed(true);
  }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(COLLAPSED_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  /** One button: collapses desktop sidebar, opens mobile drawer. */
  const onHamburger = () => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(min-width: 768px)").matches) setCollapsed((v) => !v);
    else setMobileOpen(true);
  };

  /**
   * Dashboard theme tokens — pale grey page, pure white cards, navy ink.
   * Inline so they cascade reliably regardless of `@theme inline` ordering.
   * Sidebar uses its own hardcoded dark palette above.
   */
  const lightTheme = {
    "--background": "oklch(0.97 0.005 270)",        /* page bg ~#F2F3F8 */
    "--foreground": "oklch(0.20 0.04 270)",         /* near-navy ink */
    "--card": "oklch(1 0 0)",                       /* white cards */
    "--card-foreground": "oklch(0.20 0.04 270)",
    "--popover": "oklch(1 0 0)",
    "--popover-foreground": "oklch(0.20 0.04 270)",
    "--primary": "oklch(0.70 0.21 38)",
    "--primary-foreground": "oklch(1 0 0)",
    "--secondary": "oklch(0.95 0.005 270)",
    "--secondary-foreground": "oklch(0.25 0.04 270)",
    "--muted": "oklch(0.96 0.005 270)",
    "--muted-foreground": "oklch(0.48 0.02 270)",
    "--accent": "oklch(0.93 0.02 38)",
    "--accent-foreground": "oklch(0.20 0.04 270)",
    "--destructive": "oklch(0.58 0.22 28)",
    "--border": "oklch(0.91 0.005 270)",
    "--input": "oklch(0.93 0.005 270)",
    "--ring": "oklch(0.70 0.21 38)",
  } as React.CSSProperties;

  return (
    <div
      style={lightTheme}
      className="flex min-h-screen bg-background text-foreground"
    >
      {/* ---- Desktop sidebar (dark navy) ---- */}
      <aside
        className={cn(
          "hidden shrink-0 border-r transition-[width] duration-300 md:flex md:flex-col",
          SIDEBAR_BG, SIDEBAR_BORDER, SIDEBAR_TEXT,
          collapsed ? "md:w-16" : "md:w-60",
        )}
      >
        <SidebarBrand title={title} collapsed={collapsed} />
        <SidebarSectionLabel collapsed={collapsed}>Navigation</SidebarSectionLabel>
        <SidebarNav nav={nav} pathname={pathname} collapsed={collapsed} />
      </aside>

      {/* ---- Mobile drawer (same dark sidebar) ---- */}
      <div
        aria-hidden
        onClick={() => setMobileOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden",
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Sidebar navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden",
          SIDEBAR_BG, SIDEBAR_BORDER, SIDEBAR_TEXT,
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className={cn("flex items-center justify-between border-b px-4 py-4", SIDEBAR_BORDER)}>
          <SidebarBrand title={title} collapsed={false} />
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="inline-flex size-9 items-center justify-center rounded-full border border-white/15 text-white hover:bg-white/10"
          >
            <X className="size-4" />
          </button>
        </div>
        <SidebarSectionLabel collapsed={false}>Navigation</SidebarSectionLabel>
        <SidebarNav nav={nav} pathname={pathname} collapsed={false} />
      </aside>

      {/* ---- Main column ---- */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar (white) */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-card px-3 md:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar / open menu"}
              onClick={onHamburger}
              className="inline-flex size-10 items-center justify-center rounded-md text-foreground hover:bg-muted"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <Menu className="size-5" />
            </button>
            <h1 className="ml-1 hidden truncate text-sm font-semibold sm:block">
              {pageTitle(pathname, nav, title)}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell role={user.role === "admin" ? "admin" : "center_owner"} />
            <ProfileMenu user={user} />
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-x-hidden p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

/* -------- helpers -------- */

function SidebarBrand({ title, collapsed }: { title: string; collapsed: boolean }) {
  return (
    <Link href="/" className={cn("flex h-16 items-center gap-2 border-b px-4 font-bold", SIDEBAR_BORDER)}>
      <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Star className="size-4" fill="currentColor" />
      </span>
      {!collapsed && <span className="truncate text-white">{title}</span>}
    </Link>
  );
}

function SidebarSectionLabel({
  collapsed,
  children,
}: {
  collapsed: boolean;
  children: React.ReactNode;
}) {
  if (collapsed) return <div className="mt-4 h-px" />;
  return (
    <p className={cn("px-5 pt-5 pb-2 text-[10px] font-bold uppercase tracking-[0.18em]", SIDEBAR_TEXT_DIM)}>
      {children}
    </p>
  );
}

function SidebarNav({
  nav,
  pathname,
  collapsed,
}: {
  nav: NavItem[];
  pathname: string;
  collapsed: boolean;
}) {
  return (
    <nav className="flex-1 space-y-1 overflow-y-auto p-3">
      {nav.map((n) => {
        const active = pathname === n.href || pathname.startsWith(n.href + "/");
        return (
          <Link
            key={n.href}
            href={n.href}
            title={collapsed ? n.label : undefined}
            className={cn(
              "relative block truncate rounded-md px-3 py-2 text-sm transition-colors",
              collapsed && "text-center",
              active
                ? cn(SIDEBAR_ACTIVE, SIDEBAR_ACTIVE_BAR)
                : cn(SIDEBAR_TEXT, SIDEBAR_HOVER),
            )}
          >
            {collapsed ? n.label.charAt(0) : n.label}
          </Link>
        );
      })}
    </nav>
  );
}

function pageTitle(pathname: string, nav: NavItem[], fallback: string): string {
  const match = nav.find((n) => pathname === n.href || pathname.startsWith(n.href + "/"));
  return match?.label ?? fallback;
}

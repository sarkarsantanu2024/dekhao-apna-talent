"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

export interface NavItem { href: string; label: string }

export function DashboardSidebar({ nav, title }: { nav: NavItem[]; title: string }) {
  const pathname = usePathname();
  return (
    <aside className="hidden w-60 shrink-0 border-r bg-card md:flex md:flex-col">
      <div className="flex h-16 items-center gap-2 border-b px-4 font-bold">
        <Star className="size-5 text-primary" fill="currentColor" />
        <span>{title}</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {nav.map((n) => {
          const active = pathname === n.href || pathname.startsWith(n.href + "/");
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "block rounded-md px-3 py-2 text-sm transition-colors",
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {n.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

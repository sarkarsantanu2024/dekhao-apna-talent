"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Star, Menu, X, ArrowUpRight, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";

function useIsActive() {
  const pathname = usePathname();
  return (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
}

const NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/categories", label: "Categories" },
  { href: "/rules", label: "Guidelines" },
  { href: "/prizes", label: "Prizes" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

function Wordmark({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/" onClick={onClick} className="group flex items-center gap-3">
      <span className="relative inline-flex size-9 items-center justify-center rounded-full bg-ink text-gold-soft transition-transform duration-500 group-hover:rotate-[18deg]">
        <Star className="size-4" strokeWidth={2} fill="currentColor" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.05rem] font-semibold tracking-tight text-foreground">
          Dekhao Apna <span className="italic text-gold-deep">Talent</span>
        </span>
        <span className="eyebrow mt-1 text-[0.58rem] text-muted-foreground">
          Mind Mantra Abacus
        </span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isActive = useIsActive();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock page scroll while drawer is open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "border-b border-border bg-background/85 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="container mx-auto flex h-20 items-center justify-between gap-6 px-4 sm:px-6">
          <Wordmark />

          <nav className="hidden xl:block">
            <ul className="flex items-center gap-1">
              {NAV.map((n) => {
                const active = isActive(n.href);
                return (
                  <li key={n.href}>
                    <Link
                      href={n.href}
                      aria-current={active ? "page" : undefined}
                      className={`group relative inline-flex items-center px-3.5 py-2 text-[0.82rem] font-medium tracking-tight transition-colors ${
                        active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {n.label}
                      <span
                        className={`absolute inset-x-3.5 -bottom-0.5 h-px origin-left bg-gold transition-transform duration-300 ${
                          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                        }`}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2.5">
            <Button asChild variant="fun" size="sm" className="hidden h-10 px-5 sm:inline-flex">
              <Link href="/login" className="inline-flex items-center gap-1.5">
                <LockKeyhole className="size-3.5" strokeWidth={2} />
                Login
              </Link>
            </Button>
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="site-drawer"
              onClick={() => setOpen(true)}
              className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-ink hover:bg-ink hover:text-primary-foreground xl:hidden"
            >
              <Menu className="size-5" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </header>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden
        className={`fixed inset-0 z-[60] bg-ink/45 backdrop-blur-sm transition-opacity duration-500 xl:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Right-side drawer */}
      <aside
        id="site-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        className={`fixed inset-y-0 right-0 z-[70] flex w-full flex-col bg-background text-foreground transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] xl:hidden sm:w-[420px] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <span className="eyebrow text-muted-foreground">Menu</span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-clay hover:bg-clay hover:text-white"
          >
            <X className="size-5" strokeWidth={1.75} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 py-8">
          <ul className="flex flex-col">
            {NAV.map((n, i) => (
              <li
                key={n.href}
                className={`border-b border-border/60 transition-all duration-500 ${
                  open ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"
                }`}
                style={{ transitionDelay: open ? `${120 + i * 55}ms` : "0ms" }}
              >
                <Link
                  href={n.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(n.href) ? "page" : undefined}
                  className="group flex items-baseline justify-between gap-4 py-4"
                >
                  <span className="flex items-baseline gap-3">
                    <span className="eyebrow text-[0.6rem] text-gold-deep">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`font-display text-2xl tracking-tight transition-colors ${
                        isActive(n.href) ? "italic text-gold-deep" : "text-foreground group-hover:text-gold-deep"
                      }`}
                    >
                      {n.label}
                    </span>
                  </span>
                  <ArrowUpRight
                    className="size-5 -translate-x-1 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:text-gold-deep group-hover:opacity-100"
                    strokeWidth={1.75}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div
          className={`border-t border-border px-6 py-6 transition-all duration-500 ${
            open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
          style={{ transitionDelay: open ? `${120 + NAV.length * 55}ms` : "0ms" }}
        >
          <Button asChild variant="fun" className="h-12 w-full">
            <Link href="/login" onClick={() => setOpen(false)} className="inline-flex items-center justify-center gap-2">
              <LockKeyhole className="size-4" strokeWidth={2} />
              Centre Login
            </Link>
          </Button>
          <p className="eyebrow mt-5 text-muted-foreground">Kolkata · Eastern India</p>
        </div>
      </aside>
    </>
  );
}

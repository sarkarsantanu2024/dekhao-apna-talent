"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "./icon";

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
        className={`fixed inset-x-0 top-0 z-50 border-b-2 bg-card/95 backdrop-blur-md transition-all duration-300 ${
          scrolled ? "border-border" : "border-transparent"
        }`}
      >
        <div className="container mx-auto flex h-20 items-center justify-between gap-6 px-4 sm:px-6">
          <Link href="/" className="group flex items-center gap-3">
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-brand-gradient text-white shadow-pop-sm transition-transform group-hover:-rotate-12 group-hover:scale-110">
              <span
                className="material-symbols-rounded"
                style={{ fontSize: 22, fontVariationSettings: "'FILL' 0" }}
              >
                star
              </span>
            </span>
            <span className="font-display text-base font-extrabold tracking-tight text-foreground sm:text-lg">
              Dekhao Apna Talent
            </span>
          </Link>

          <nav className="hidden xl:block">
            <ul className="flex items-center gap-2">
              {NAV.map((n) => {
                const active = isActive(n.href);
                return (
                  <li key={n.href}>
                    <Link
                      href={n.href}
                      aria-current={active ? "page" : undefined}
                      className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                        active
                          ? "bg-crayon-grape/12 text-crayon-grape"
                          : "text-foreground/70 hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {n.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="fun"
              size="sm"
              className="hidden h-10 px-5 sm:inline-flex"
            >
              <Link href="/login" className="inline-flex items-center gap-1.5">
                <Icon name="lock_open" size={16} />
                Login
              </Link>
            </Button>
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="site-drawer"
              onClick={() => setOpen(true)}
              className="inline-flex size-11 items-center justify-center rounded-full border-2 border-border bg-card text-foreground shadow-pop-sm hover:border-crayon-grape hover:text-crayon-grape xl:hidden"
            >
              <Icon name="menu" size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden
        className={`fixed inset-0 z-[60] bg-foreground/40 backdrop-blur-sm transition-opacity duration-500 xl:hidden ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* Right-side drawer */}
      <aside
        id="site-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        className={`fixed inset-y-0 right-0 z-[70] flex w-full flex-col border-l-4 border-border bg-background text-foreground transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] xl:hidden sm:w-[420px] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b-2 border-border px-6 py-5">
          <span className="font-fun text-base font-semibold text-crayon-grape">
            Menu
          </span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="group inline-flex size-11 items-center justify-center rounded-full border-2 border-border bg-card text-foreground shadow-pop-sm transition-colors hover:border-crayon-coral hover:bg-crayon-coral/10 hover:text-crayon-coral"
          >
            <Icon name="close" size={22} />
          </button>
        </div>

        {/* Nav links — each slides in with stagger via CSS delay */}
        <nav className="flex-1 overflow-y-auto px-6 py-6">
          <ul className="flex flex-col gap-1">
            {NAV.map((n, i) => (
              <li
                key={n.href}
                className={`transition-all duration-500 ${
                  open ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"
                }`}
                style={{ transitionDelay: open ? `${120 + i * 60}ms` : "0ms" }}
              >
                <Link
                  href={n.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(n.href) ? "page" : undefined}
                  className={`group flex items-center justify-between rounded-2xl px-4 py-4 ${
                    isActive(n.href)
                      ? "bg-crayon-grape/12 text-crayon-grape"
                      : "text-foreground/85 hover:bg-muted"
                  }`}
                >
                  <span className="text-2xl font-extrabold tracking-tight">
                    {n.label}
                  </span>
                  <Icon
                    name="arrow_forward"
                    size={20}
                    className="opacity-40 transition-all group-hover:translate-x-1 group-hover:text-crayon-coral group-hover:opacity-100"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Drawer footer CTA */}
        <div
          className={`border-t-2 border-border px-6 py-6 transition-all duration-500 ${
            open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
          style={{
            transitionDelay: open ? `${120 + NAV.length * 60}ms` : "0ms",
          }}
        >
          <Button asChild variant="fun" className="h-12 w-full">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center gap-2"
            >
              <Icon name="lock_open" size={18} />
              Login
            </Link>
          </Button>
          <p className="mt-4 font-fun text-sm text-muted-foreground">
            Kolkata · Eastern India
          </p>
        </div>
      </aside>
    </>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "./icon";

function useIsActive() {
  const pathname = usePathname();
  return (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
}

const NAV = [
  { href: "/",           label: "Home" },
  { href: "/about",      label: "About" },
  { href: "/categories", label: "Categories" },
  { href: "/rules",      label: "Guidelines" },
  { href: "/prizes",     label: "Prizes" },
  { href: "/gallery",    label: "Gallery" },
  { href: "/contact",    label: "Contact" },
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
      return () => { document.body.style.overflow = prev; };
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
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-white/10 bg-black/70 backdrop-blur-md"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto flex h-20 items-center justify-between gap-6 px-4 sm:px-6">
          <Link href="/" className="group flex items-center gap-3">
            <span className="inline-flex size-9 items-center justify-center rounded-full bg-[#A855F7] text-black transition-transform group-hover:rotate-90">
              <span className="text-sm font-black">D</span>
            </span>
            <span className="text-sm font-black uppercase tracking-[0.18em] text-white sm:text-base">
              Dekhao Apna Talent
            </span>
          </Link>

          <nav className="hidden xl:block">
            <ul className="flex items-center gap-8">
              {NAV.map((n) => {
                const active = isActive(n.href);
                return (
                  <li key={n.href}>
                    <Link
                      href={n.href}
                      aria-current={active ? "page" : undefined}
                      className={`group inline-flex items-baseline gap-1.5 text-sm font-semibold uppercase tracking-wider transition-colors ${
                        active ? "text-white" : "text-white/65 hover:text-white"
                      }`}
                    >
                      <span className="relative">
                        {n.label}
                        <span
                          className={`absolute -bottom-1 left-0 h-0.5 bg-brand-gradient transition-all duration-300 ${
                            active ? "w-full" : "w-0 group-hover:w-full"
                          }`}
                        />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              asChild
              size="sm"
              className="hidden font-bold uppercase tracking-wider sm:inline-flex"
            >
              <Link href="/login">Login / Register</Link>
            </Button>
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="site-drawer"
              onClick={() => setOpen(true)}
              className="inline-flex size-11 items-center justify-center rounded-full border border-white/15 text-white hover:bg-white/5 xl:hidden"
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
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-500 xl:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Right-side drawer */}
      <aside
        id="site-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        className={`fixed inset-y-0 right-0 z-[70] flex w-full flex-col bg-[#0B0B0F] text-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] xl:hidden sm:w-[420px] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/50">
            Menu
          </span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="group inline-flex size-11 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:border-[#A855F7] hover:bg-[#A855F7]/10 hover:text-[#A855F7]"
          >
            <Icon name="close" size={22} />
          </button>
        </div>

        {/* Nav links — each slides in with stagger via CSS delay */}
        <nav className="flex-1 overflow-y-auto px-6 py-6">
          <ul className="flex flex-col">
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
                  className={`group flex items-baseline justify-between border-b border-white/5 py-5 ${
                    isActive(n.href) ? "text-white" : "text-white/80 hover:text-[#A855F7]"
                  }`}
                >
                  <span className={`text-2xl font-black uppercase tracking-tight ${isActive(n.href) ? "text-gradient" : ""}`}>
                    {n.label}
                  </span>
                  <Icon
                    name="north_east"
                    size={20}
                    className="opacity-40 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#A855F7] group-hover:opacity-100"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Drawer footer CTA */}
        <div
          className={`border-t border-white/10 px-6 py-6 transition-all duration-500 ${
            open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
          style={{ transitionDelay: open ? `${120 + NAV.length * 60}ms` : "0ms" }}
        >
          <Button
            asChild
            className="h-12 w-full font-bold uppercase tracking-wider"
          >
            <Link href="/login" onClick={() => setOpen(false)} className="inline-flex items-center justify-center gap-2">
              Login / Register
              <Icon name="arrow_outward" size={18} />
            </Link>
          </Button>
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="mt-3 hidden w-full items-center justify-center gap-2 rounded-md border border-white/15 py-3 text-sm font-bold uppercase tracking-wider text-white hover:border-[#A855F7] hover:text-[#A855F7]"
          >
            Login
          </Link>
          <p className="mt-4 text-[11px] uppercase tracking-[0.22em] text-white/40">
            Kolkata · Eastern India
          </p>
        </div>
      </aside>
    </>
  );
}

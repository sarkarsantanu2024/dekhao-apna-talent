"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "./icon";

const NAV = [
  { href: "/",           label: "Home",       num: "01" },
  { href: "/about",      label: "About",      num: "02" },
  { href: "/categories", label: "Categories", num: "03" },
  { href: "/rules",      label: "Guidelines", num: "04" },
  { href: "/prizes",     label: "Prizes",     num: "05" },
  { href: "/gallery",    label: "Gallery",    num: "06" },
  { href: "/contact",    label: "Contact",    num: "07" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
            <span className="inline-flex size-9 items-center justify-center rounded-full bg-[#FF5A1F] text-black transition-transform group-hover:rotate-90">
              <span className="text-sm font-black">D</span>
            </span>
            <span className="text-sm font-black uppercase tracking-[0.18em] text-white sm:text-base">
              Dekhao Apna Talent
            </span>
          </Link>

          <nav className="hidden xl:block">
            <ul className="flex items-center gap-8">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    className="group inline-flex items-baseline gap-1.5 text-[13px] font-medium uppercase tracking-wider text-white/70 transition-colors hover:text-white"
                  >
                    <span className="text-[10px] text-[#FF5A1F]/80">{n.num}</span>
                    <span className="relative">
                      {n.label}
                      <span className="absolute -bottom-1 left-0 h-px w-0 bg-[#FF5A1F] transition-all duration-300 group-hover:w-full" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              asChild
              size="sm"
              className="hidden bg-[#FF5A1F] font-bold uppercase tracking-wider text-black hover:bg-[#ff6b35] sm:inline-flex"
            >
              <Link href="/register">Register</Link>
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
            className="group inline-flex size-11 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:border-[#FF5A1F] hover:bg-[#FF5A1F]/10 hover:text-[#FF5A1F]"
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
                  className="group flex items-baseline justify-between border-b border-white/5 py-5 hover:text-[#FF5A1F]"
                >
                  <span className="inline-flex items-baseline gap-3">
                    <span className="font-mono text-xs text-[#FF5A1F]">{n.num}</span>
                    <span className="text-2xl font-black uppercase tracking-tight">
                      {n.label}
                    </span>
                  </span>
                  <Icon
                    name="north_east"
                    size={20}
                    className="opacity-40 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#FF5A1F] group-hover:opacity-100"
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
            className="h-12 w-full bg-[#FF5A1F] font-bold uppercase tracking-wider text-black hover:bg-[#ff6b35]"
          >
            <Link href="/register" onClick={() => setOpen(false)} className="inline-flex items-center justify-center gap-2">
              Register your centre
              <Icon name="arrow_outward" size={18} />
            </Link>
          </Button>
          <p className="mt-4 text-[11px] uppercase tracking-[0.22em] text-white/40">
            Kolkata · Eastern India
          </p>
        </div>
      </aside>
    </>
  );
}

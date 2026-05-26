import Link from "next/link";
import { EVENT_NAME, EVENT_YEAR } from "@/constants";
import { Icon } from "./icon";

export function SiteFooter() {
  return (
    <footer className="relative mt-auto border-t border-white/10 bg-black">
      <div className="container mx-auto px-6 py-20">
        {/* Oversized brand line, x2y-style */}
        <Link href="/" className="block">
          <h2 className="text-balance text-[clamp(2.5rem,9vw,8rem)] font-black uppercase leading-[0.92] tracking-tight text-white transition-colors hover:text-[#FF5A1F]">
            Dekhao Apna <span className="text-[#FF5A1F]">Talent.</span>
          </h2>
        </Link>

        <div className="mt-16 grid gap-10 border-t border-white/10 pt-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <p className="text-sm text-white/60">
              Eastern India&apos;s biggest talent contest for students aged 6–14, presented by Mind Mantra Abacus.
            </p>
          </div>

          <FooterCol title="Event" links={[
            { href: "/about",      label: "About" },
            { href: "/categories", label: "Categories" },
            { href: "/rules",      label: "Guidelines" },
            { href: "/prizes",     label: "Prizes" },
            { href: "/gallery",    label: "Gallery" },
          ]} />

          <FooterCol title="For Centres" links={[
            { href: "/register", label: "Register Centre" },
            { href: "/login",    label: "Login" },
            { href: "/contact",  label: "Support" },
          ]} />

          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/50">Office</h4>
            <p className="mt-4 text-sm text-white/80">
              Mind Mantra Abacus<br />Kolkata, West Bengal
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/50">
          <span>© {EVENT_YEAR} {EVENT_NAME}. All rights reserved.</span>
          <span className="font-mono uppercase tracking-wider">v.{EVENT_YEAR}</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h4 className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/50">{title}</h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="group inline-flex items-center gap-1.5 text-sm text-white/80 transition-colors hover:text-[#FF5A1F]"
            >
              {l.label}
              <Icon name="arrow_outward" size={14} className="opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

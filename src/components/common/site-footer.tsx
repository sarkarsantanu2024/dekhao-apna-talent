import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
import { EVENT_NAME, EVENT_YEAR } from "@/constants";
import { SOCIALS } from "./social-icons";

export function SiteFooter() {
  return (
    <footer className="on-ink relative mt-auto overflow-hidden bg-ink text-[#f3ead9]" style={{ ["--ink" as string]: "#1b1510" }}>
      {/* warm stage glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 left-1/2 h-72 w-[120%] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(199,146,51,0.14),transparent_70%)]"
      />

      <div className="container relative mx-auto px-6 py-16 sm:py-24">
        {/* Oversized serif brand line */}
        <div className="flex items-start justify-between gap-6">
          <div>
            <span className="eyebrow text-gold-soft/90">Eastern India · Edition {EVENT_YEAR}</span>
            <Link href="/" className="mt-5 block">
              <h2 className="text-balance font-display text-[clamp(2.75rem,9vw,7rem)] font-semibold leading-[0.92] tracking-[-0.03em] text-[#f8f1e3]">
                Dekhao Apna <span className="italic text-gold-soft">Talent</span>
              </h2>
            </Link>
          </div>
          <Star className="hidden size-8 shrink-0 text-gold-soft/70 sm:block" strokeWidth={1.5} />
        </div>

        <div className="mt-16 grid gap-12 border-t border-[#f3ead9]/12 pt-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="max-w-sm text-[0.95rem] leading-relaxed text-[#f3ead9]/65">
              Eastern India&apos;s most joyful talent stage for children aged 6–14 — dance, song,
              mental-math and more — presented with care by Mind Mantra Abacus.
            </p>
            <div className="mt-7 flex items-center gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="inline-flex size-11 items-center justify-center rounded-full border border-[#f3ead9]/15 text-[#f3ead9]/70 transition-all hover:-translate-y-0.5 hover:border-gold hover:bg-gold hover:text-ink"
                >
                  <s.Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterCol className="md:col-span-3" title="The Event" links={[
            { href: "/about",      label: "About" },
            { href: "/categories", label: "Categories" },
            { href: "/rules",      label: "Guidelines" },
            { href: "/prizes",     label: "Prizes" },
            { href: "/gallery",    label: "Gallery" },
          ]} />

          <FooterCol className="md:col-span-2" title="For Centres" links={[
            { href: "/login",   label: "Centre Login" },
            { href: "/contact", label: "Support" },
          ]} />

          <div className="md:col-span-2">
            <h4 className="eyebrow text-gold-soft/90">Find us</h4>
            <p className="mt-4 text-sm leading-relaxed text-[#f3ead9]/70">
              Mind Mantra Abacus<br />
              17/K/6, Dakhindari Road,<br />
              Near Ultadanga,<br />
              Kolkata – 700048
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-[#f3ead9]/12 pt-6">
          <span className="text-xs text-[#f3ead9]/45">
            © {EVENT_YEAR} {EVENT_NAME}. Crafted for young stars.
          </span>
          <span className="eyebrow text-[0.62rem] text-[#f3ead9]/40">Edition {EVENT_YEAR}</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links, className = "" }: { title: string; links: { href: string; label: string }[]; className?: string }) {
  return (
    <div className={className}>
      <h4 className="eyebrow text-gold-soft/90">{title}</h4>
      <ul className="mt-4 space-y-3">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="group inline-flex items-center gap-1.5 text-sm text-[#f3ead9]/70 transition-colors hover:text-gold-soft"
            >
              {l.label}
              <ArrowUpRight
                className="size-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                strokeWidth={1.75}
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

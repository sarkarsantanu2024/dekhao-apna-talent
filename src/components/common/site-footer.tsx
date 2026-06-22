import Link from "next/link";
import { EVENT_NAME, EVENT_YEAR } from "@/constants";
import { Icon } from "./icon";
import { SOCIALS } from "./social-icons";

export function SiteFooter() {
  return (
    <footer className="relative mt-auto overflow-hidden bg-[#241b38] text-white">
      {/* friendly colour strip */}
      <div className="h-2 w-full bg-brand-gradient" />
      <div className="container mx-auto px-6 py-16 sm:py-20">
        {/* Oversized brand line */}
        <Link href="/" className="block">
          <h2 className="text-balance text-[clamp(2.5rem,9vw,7rem)] font-extrabold leading-[0.95] tracking-tight text-white">
            Dekhao Apna <span className="text-gradient">Talent!</span>
          </h2>
        </Link>

        <div className="mt-14 grid gap-10 border-t border-white/10 pt-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <p className="text-base text-white/70">
              Eastern India&apos;s most fun talent contest for kids aged 6–14, presented with love by Mind Mantra Abacus.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className={`inline-flex size-11 items-center justify-center rounded-full border-2 border-white/15 bg-white/5 text-white/75 transition-all hover:-translate-y-0.5 hover:border-transparent hover:text-white ${s.hover}`}
                >
                  <s.Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterCol title="The Event" links={[
            { href: "/about",      label: "About" },
            { href: "/categories", label: "Categories" },
            { href: "/rules",      label: "Guidelines" },
            { href: "/prizes",     label: "Prizes" },
            { href: "/gallery",    label: "Gallery" },
          ]} />

          <FooterCol title="For Centres" links={[
            { href: "/login",   label: "Centre Login" },
            { href: "/contact", label: "Support" },
          ]} />

          <div>
            <h4 className="font-fun text-base font-semibold text-crayon-sun">Find us</h4>
            <p className="mt-4 text-sm text-white/80">
              Mind Mantra Abacus<br />
              17/K/6, Dakhindari Road,<br />
              Near Ultadanga, Kolkata – 700048
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/50">
          <span>© {EVENT_YEAR} {EVENT_NAME}. Made for young stars. ⭐</span>
          <span className="font-mono uppercase tracking-wider">Edition {EVENT_YEAR}</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h4 className="font-fun text-base font-semibold text-crayon-sun">{title}</h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-white/75 transition-colors hover:text-crayon-coral"
            >
              {l.label}
              <Icon name="arrow_forward" size={14} className="opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

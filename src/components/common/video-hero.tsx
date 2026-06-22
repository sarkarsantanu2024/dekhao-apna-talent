"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Cake, Trophy, Store, Play, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EVENT_YEAR } from "@/constants";
import { Magnetic } from "./magnetic";
import { HeroMedia } from "./hero-media";

gsap.registerPlugin(useGSAP);

const CHIPS = [
  { Icon: Cake, label: "Ages 6–14" },
  { Icon: Trophy, label: "₹5,000 top prize" },
  { Icon: Store, label: "200+ centres" },
];

export function VideoHero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const tl = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.3 });
      tl.from("[data-hero-eyebrow]", { y: 18, autoAlpha: 0, duration: 0.5 })
        .from("[data-hero-line]", { yPercent: 115, duration: 0.8, stagger: 0.12 }, "-=0.1")
        .from("[data-hero-sub]", { y: 18, autoAlpha: 0, duration: 0.55 }, "-=0.4")
        .from("[data-hero-chip]", { y: 14, autoAlpha: 0, duration: 0.4, stagger: 0.07 }, "-=0.3")
        .from("[data-hero-cta]", { y: 16, autoAlpha: 0, duration: 0.45, stagger: 0.08 }, "-=0.25")
        .from("[data-hero-media]", { autoAlpha: 0, y: 30, duration: 0.9 }, "-=1.0")
        .from("[data-hero-seal]", { scale: 0.6, autoAlpha: 0, duration: 0.6, ease: "back.out(1.7)" }, "-=0.4");
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="relative isolate overflow-hidden bg-band-butter pt-32 pb-20 sm:pt-36 lg:pt-44 lg:pb-28"
    >
      {/* warm paper depth */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_8%,rgba(199,146,51,0.16),transparent_46%),radial-gradient(circle_at_5%_90%,rgba(192,106,63,0.10),transparent_50%)]"
      />
      <div aria-hidden className="paper-grain pointer-events-none absolute inset-0 -z-10 opacity-60" />

      <div className="container relative mx-auto grid items-center gap-12 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        {/* Left — editorial copy */}
        <div className="min-w-0">
          <div data-hero-eyebrow className="flex items-center gap-4">
            <span className="h-px w-10 bg-gold" />
            <span className="eyebrow text-gold-deep">The Inaugural Edition · {EVENT_YEAR}</span>
          </div>

          <h1 className="mt-7 font-display font-semibold leading-[0.92] tracking-[-0.03em]">
            <span className="block overflow-hidden">
              <span data-hero-line className="block text-5xl sm:text-6xl md:text-[4.4rem]">
                Dekhao Apna
              </span>
            </span>
            <span className="block overflow-hidden pb-2">
              <span data-hero-line className="block text-6xl italic text-gold-deep sm:text-7xl md:text-[5.4rem]">
                Talent.
              </span>
            </span>
          </h1>

          <p data-hero-sub className="mt-7 max-w-md text-lg leading-relaxed text-muted-foreground">
            Mind Mantra Abacus presents its first-ever national talent stage for children
            6–14. Dance, sing, solve mental math or bring your own gift — and shine before
            celebrated judges.
          </p>

          <div className="mt-8 flex flex-wrap gap-2.5">
            {CHIPS.map((c) => (
              <span
                key={c.label}
                data-hero-chip
                className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-card/70 px-4 py-2 text-sm font-medium text-foreground backdrop-blur-sm"
              >
                <c.Icon className="size-4 text-gold-deep" strokeWidth={1.75} />
                {c.label}
              </span>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Magnetic data-hero-cta>
              <Button asChild variant="fun" size="xl" className="group">
                <Link href="/gallery" className="inline-flex items-center gap-2">
                  <Play className="size-4 fill-current" strokeWidth={0} />
                  Watch the finale
                </Link>
              </Button>
            </Magnetic>
            <Magnetic data-hero-cta>
              <Button asChild variant="outline" size="xl" className="group">
                <Link href="/categories" className="inline-flex items-center gap-2">
                  Explore categories
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" strokeWidth={1.75} />
                </Link>
              </Button>
            </Magnetic>
          </div>
        </div>

        {/* Right — editorial media carousel with a rotating gold seal */}
        <div data-hero-media className="relative mx-auto w-full min-w-0 max-w-xl lg:max-w-none">
          <HeroMedia />

          {/* Rotating circular seal — premium-playful signature */}
          <div
            data-hero-seal
            className="absolute -left-7 -top-7 z-30 hidden size-28 place-items-center rounded-full bg-card shadow-float sm:grid"
          >
            <svg viewBox="0 0 100 100" className="animate-spin-slow size-full">
              <defs>
                <path id="seal-arc" d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0" />
              </defs>
              <text className="fill-ink-soft" style={{ fontSize: "9.5px", letterSpacing: "2.6px", fontWeight: 600 }}>
                <textPath href="#seal-arc" startOffset="0">
                  DEKHAO · APNA · TALENT · {EVENT_YEAR} ·
                </textPath>
              </text>
            </svg>
            <span className="absolute grid size-12 place-items-center rounded-full bg-gold text-ink">
              <Play className="size-4 translate-x-px fill-current" strokeWidth={0} />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

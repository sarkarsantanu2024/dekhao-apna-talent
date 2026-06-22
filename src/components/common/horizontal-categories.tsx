"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Music, MicVocal, Calculator, Sparkles, ArrowRight, Rocket, Ticket } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CATEGORIES } from "@/constants";
import { CATEGORY_IMAGES } from "@/constants/media";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const META: Record<string, { Icon: LucideIcon; accent: string }> = {
  dance:          { Icon: Music,      accent: "var(--clay)" },
  song:           { Icon: MicVocal,   accent: "var(--c-bubblegum)" },
  "mental-math":  { Icon: Calculator, accent: "var(--c-sky)" },
  "other-talent": { Icon: Sparkles,   accent: "var(--c-mint)" },
};

/**
 * Horizontal pinned-scroll section: while the section is in view, the page
 * "freezes" vertically and the card track translates left as the user scrolls.
 */
export function HorizontalCategories() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!root.current || !track.current) return;
      if (window.matchMedia("(max-width: 768px)").matches) return; // mobile: vertical
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const distance = () => {
        const rect = track.current!.getBoundingClientRect();
        const inset = 24;
        return Math.max(0, rect.right - window.innerWidth + inset);
      };

      gsap.to(track.current, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="relative overflow-hidden bg-band-butter py-20 sm:py-28 md:h-[100svh] md:py-0"
    >
      <div className="container mx-auto flex h-full flex-col justify-center px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-4">
              <span className="h-px w-10 bg-gold" />
              <span className="eyebrow text-gold-deep">No. 02 — The Stages</span>
            </div>
            <h2 className="mt-5 max-w-2xl font-display text-4xl font-semibold leading-[1.02] tracking-[-0.02em] sm:text-6xl">
              What will <span className="italic text-gold-deep">you</span> show us?
            </h2>
          </div>
          <p className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
            Scroll to explore
            <ArrowRight className="size-4" strokeWidth={1.75} />
          </p>
        </div>

        {/* Track — vertical stack on mobile, horizontal pinned scroll on md+ */}
        <div
          ref={track}
          className="mt-10 flex flex-col gap-5 md:mt-14 md:w-max md:flex-row md:gap-6"
        >
          {CATEGORIES.map((c, i) => {
            const m = META[c.slug] ?? META.dance;
            const bg = CATEGORY_IMAGES[c.slug];
            return (
              <Link
                key={c.slug}
                href="/categories"
                className="group lift relative flex w-full flex-col overflow-hidden rounded-2xl border border-ink/10 bg-card shadow-pop-sm md:h-[480px] md:w-[370px]"
              >
                {/* image window */}
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  {bg && (
                    <Image
                      src={bg}
                      alt={c.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 370px"
                      className="object-cover transition-transform duration-[1.1s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/45 to-transparent" />
                  <span className="absolute right-4 top-4 font-display text-sm italic text-white/85">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="absolute bottom-4 left-4 inline-flex size-11 items-center justify-center rounded-full bg-card text-ink shadow-pop-sm"
                    style={{ color: m.accent }}
                  >
                    <m.Icon className="size-5" strokeWidth={1.75} />
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{c.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.blurb}</p>
                  <div className="mt-auto flex items-center justify-between border-t border-border pt-5">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                      <Ticket className="size-4 text-gold-deep" strokeWidth={1.75} />
                      ₹{c.fee}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gold-deep">
                      Pick this
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" strokeWidth={1.75} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}

          {/* Tail card — ink finale */}
          <article className="on-ink relative flex w-full flex-col items-start justify-center overflow-hidden rounded-2xl bg-ink p-8 text-[#f3ead9] shadow-pop md:h-[480px] md:w-[360px] md:p-10" style={{ ["--ink" as string]: "#1b1510" }}>
            <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 size-44 rounded-full bg-[radial-gradient(circle,rgba(199,146,51,0.25),transparent_70%)]" />
            <Rocket className="size-11 text-gold-soft" strokeWidth={1.5} />
            <h3 className="mt-6 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Ready to<br /><span className="italic text-gold-soft">shine?</span>
            </h3>
            <p className="mt-3 text-[#f3ead9]/70">Join through your nearest Mind Mantra centre and grab your chest card.</p>
            <Link
              href="/contact"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5"
            >
              Find a centre <ArrowRight className="size-4" strokeWidth={2} />
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}

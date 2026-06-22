"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { MaskReveal } from "./mask-reveal";
import type { BandColor } from "./playful";

gsap.registerPlugin(useGSAP);

type Props = {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  /** kept for call-site compatibility; section dividers are flat now */
  nextBg?: BandColor;
};

/**
 * Editorial inner-page masthead: warm paper, a faint oversized serif watermark
 * of the section name, a gold rule + small-caps eyebrow, and a Fraunces title.
 */
export function PageHero({ eyebrow, title, subtitle }: Props) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const tl = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.2 });
      tl.from("[data-hero-eyebrow]", { y: 16, autoAlpha: 0, duration: 0.55 })
        .from("[data-hero-sub]", { y: 18, autoAlpha: 0, duration: 0.6 }, "+=0.5");
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="relative isolate overflow-hidden bg-band-butter pt-36 pb-20 sm:pt-44 sm:pb-28"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_12%,rgba(199,146,51,0.16),transparent_48%),radial-gradient(circle_at_8%_92%,rgba(192,106,63,0.10),transparent_52%)]"
      />
      <div aria-hidden className="paper-grain pointer-events-none absolute inset-0 -z-10 opacity-50" />

      {/* faint oversized serif watermark of the section name */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -bottom-[6vw] select-none text-center font-display text-[26vw] font-semibold italic leading-none tracking-[-0.04em] text-ink/[0.045]"
      >
        {eyebrow ?? "Stage"}
      </div>

      <div className="container relative mx-auto px-6">
        {eyebrow && (
          <div data-hero-eyebrow className="flex items-center gap-4">
            <span className="h-px w-12 bg-gold" />
            <span className="eyebrow text-gold-deep">{eyebrow}</span>
          </div>
        )}
        <MaskReveal
          as="h1"
          immediate
          delay={0.4}
          stagger={0.08}
          className="mt-7 block max-w-4xl text-balance font-display text-5xl font-semibold leading-[1.0] tracking-[-0.03em] sm:text-7xl md:text-8xl"
        >
          {title}
        </MaskReveal>
        {subtitle && (
          <p data-hero-sub className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}

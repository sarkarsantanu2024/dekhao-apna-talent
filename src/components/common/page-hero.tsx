"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { MaskReveal } from "./mask-reveal";
import { Doodles, Wave, type BandColor } from "./playful";

gsap.registerPlugin(useGSAP);

type Props = {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  /** colour of the section that follows — controls the wave divider */
  nextBg?: BandColor;
};

export function PageHero({ eyebrow, title, subtitle, nextBg = "cream" }: Props) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.25 });
      tl.from("[data-hero-eyebrow]", { y: 16, opacity: 0, duration: 0.55 })
        .from("[data-hero-sub]",     { y: 18, opacity: 0, duration: 0.6 }, "+=0.6");
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="relative isolate overflow-hidden bg-band-butter pt-32 pb-24 sm:pt-40 sm:pb-32"
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(155,93,229,0.14),transparent_50%),radial-gradient(circle_at_10%_85%,rgba(255,107,107,0.12),transparent_50%)]"
      />
      <Doodles />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -bottom-2 select-none text-center text-[24vw] font-extrabold uppercase leading-none tracking-tighter text-foreground/4 sm:-bottom-6"
      >
        {eyebrow ?? "Stage"}
      </div>
      <div className="container relative mx-auto px-6">
        {eyebrow && (
          <div
            data-hero-eyebrow
            className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-1.5 shadow-pop-sm"
          >
            <span className="material-symbols-rounded text-crayon-sun" style={{ fontSize: 18, fontVariationSettings: "'FILL' 0" }}>
              star
            </span>
            <span className="font-fun text-base font-semibold text-crayon-grape">{eyebrow}</span>
          </div>
        )}
        <MaskReveal
          as="h1"
          immediate
          delay={0.45}
          stagger={0.06}
          className="mt-6 block max-w-4xl text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
        >
          {title}
        </MaskReveal>
        {subtitle && (
          <p data-hero-sub className="mt-7 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            {subtitle}
          </p>
        )}
      </div>
      <Wave to={nextBg} />
    </section>
  );
}

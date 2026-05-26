"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { MaskReveal } from "./mask-reveal";

gsap.registerPlugin(useGSAP);

type Props = {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
};

export function PageHero({ eyebrow, title, subtitle }: Props) {
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
      className="relative isolate overflow-hidden border-b border-white/10 bg-black pt-32 pb-16 sm:pt-40 sm:pb-24"
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(255,90,31,0.18),transparent_50%),radial-gradient(circle_at_10%_85%,rgba(255,90,31,0.08),transparent_50%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -bottom-8 select-none text-center text-[24vw] font-black uppercase leading-none tracking-tighter text-white/[0.03] sm:-bottom-12"
      >
        {eyebrow ?? "Stage"}
      </div>
      <div className="container relative mx-auto px-6">
        {eyebrow && (
          <div data-hero-eyebrow className="inline-flex items-center gap-3">
            <span className="font-mono text-[#FF5A1F]">/</span>
            <span className="h-px w-10 bg-white/30" />
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/70">{eyebrow}</span>
          </div>
        )}
        <MaskReveal
          as="h1"
          immediate
          delay={0.45}
          stagger={0.06}
          className="mt-6 block max-w-4xl text-balance text-4xl font-black uppercase leading-[1.02] tracking-tight sm:text-6xl md:text-7xl"
        >
          {title}
        </MaskReveal>
        {subtitle && (
          <p data-hero-sub className="mt-6 max-w-2xl text-base text-white/65 sm:text-lg">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}

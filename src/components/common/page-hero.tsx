"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { MaskReveal } from "./mask-reveal";
import { Decor } from "./decor";

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
        className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(168,85,247,0.22),transparent_50%),radial-gradient(circle_at_10%_85%,rgba(236,72,153,0.12),transparent_50%)]"
      />
      <Decor />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -bottom-8 select-none text-center text-[24vw] font-black uppercase leading-none tracking-tighter text-white/[0.03] sm:-bottom-12"
      >
        {eyebrow ?? "Stage"}
      </div>
      <div className="container relative mx-auto px-6">
        {eyebrow && (
          <div data-hero-eyebrow className="inline-flex items-center gap-3">
            <span className="font-script text-3xl leading-none text-gradient sm:text-4xl">{eyebrow}</span>
            <span className="h-px w-10 bg-white/30" />
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
          <p data-hero-sub className="mt-7 max-w-2xl text-lg text-white/70 sm:text-xl">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}

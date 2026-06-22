"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Star } from "lucide-react";

gsap.registerPlugin(useGSAP);

const WORDS = ["Dekhao", "Apna", "Talent"];

/**
 * Theatrical intro: a darkened stage with swaying spotlights, a glowing 3D
 * gold award spinning centre-stage, the serif wordmark rising into view, then
 * the whole curtain lifts away.
 */
export function PageLoader() {
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [mounted, setMounted] = useState(true);

  useGSAP(
    () => {
      const lines = gsap.utils.toArray<HTMLElement>("[data-line]");
      const meta = gsap.utils.toArray<HTMLElement>("[data-meta]");
      const count = { v: 0 };

      const setCount = () => {
        if (counter.current) counter.current.textContent = String(Math.round(count.v)).padStart(2, "0");
      };

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        count.v = 100;
        setCount();
        gsap.set([...lines, ...meta, bar.current, "[data-medal]"], { clearProps: "all" });
        gsap.to(root.current, { autoAlpha: 0, duration: 0.4, delay: 0.4, onComplete: () => setMounted(false) });
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
          gsap
            .timeline({ onComplete: () => setMounted(false) })
            .to("[data-medal]", { scale: 1.15, opacity: 0, duration: 0.5, ease: "power2.in" })
            .to(lines, { yPercent: -120, duration: 0.6, ease: "power3.in", stagger: 0.06 }, "<")
            .to(meta, { opacity: 0, duration: 0.3 }, "<")
            .to(root.current, { yPercent: -100, duration: 1.0, ease: "power4.inOut" }, "-=0.15");
        },
      });

      tl
        .from("[data-medal]", { scale: 0.4, opacity: 0, y: 30, duration: 0.9, ease: "back.out(1.6)" })
        .from(meta, { y: 16, opacity: 0, duration: 0.5, stagger: 0.08 }, "-=0.5")
        .from(lines, { yPercent: 120, duration: 0.9, ease: "power4.out", stagger: 0.08 }, "-=0.3")
        .to(count, { v: 100, duration: 1.7, ease: "power2.inOut", onUpdate: setCount }, "-=0.6")
        .to(bar.current, { scaleX: 1, duration: 1.7, ease: "power2.inOut" }, "<");
    },
    { scope: root }
  );

  if (!mounted) return null;

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[100] flex flex-col overflow-hidden text-[#f5ecda]"
      style={{ background: "radial-gradient(ellipse at 50% 0%, #2a2017 0%, #1a140f 55%, #120d09 100%)" }}
    >
      {/* Stage lighting */}
      <span aria-hidden className="dat-beam dat-beam-l" />
      <span aria-hidden className="dat-beam dat-beam-r" />
      <span aria-hidden className="dat-stage-glow" />

      {/* Twinkling sparkles */}
      <span aria-hidden className="pointer-events-none absolute inset-0">
        {SPARKS.map((s, i) => (
          <span
            key={i}
            className="animate-twinkle absolute rounded-full bg-gold-soft"
            style={{ left: s.x, top: s.y, width: s.s, height: s.s, animationDelay: `${s.d}s` }}
          />
        ))}
      </span>

      {/* Top meta */}
      <div className="relative flex items-center justify-between px-6 pt-9 sm:px-12">
        <span data-meta className="eyebrow text-gold-soft/90">Mind Mantra Abacus presents</span>
        <span data-meta className="eyebrow text-[#f5ecda]/55">Est. 2026</span>
      </div>

      {/* Centre stage — spinning 3D award + wordmark */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div data-medal className="medal-scene mb-9">
          <div className="medal-coin size-36 sm:size-44">
            <div className="medal-face">
              <div className="flex flex-col items-center gap-1">
                <Star className="size-12 sm:size-14" strokeWidth={1.5} fill="rgba(255,243,207,0.65)" />
                <span className="text-[0.6rem] font-bold tracking-[0.25em]" style={{ fontFamily: "var(--font-fun)" }}>
                  DAT
                </span>
              </div>
            </div>
            <div className="medal-face medal-back">
              <span className="font-display text-3xl font-semibold" style={{ color: "#6b430b" }}>
                2026
              </span>
            </div>
            <span className="medal-sheen" />
          </div>
          {/* ribbon tails */}
          <span aria-hidden className="absolute left-1/2 top-[88%] -translate-x-[28px]">
            <span className="medal-ribbon" style={{ borderTop: "30px solid #c06a3f" }} />
          </span>
          <span aria-hidden className="absolute left-1/2 top-[88%] translate-x-[6px]">
            <span className="medal-ribbon" style={{ borderTop: "30px solid #9c6f1f" }} />
          </span>
        </div>

        <h2 className="font-display font-semibold leading-[0.95] tracking-[-0.03em] text-[13vw] sm:text-[8.5vw] lg:text-[6.5rem]">
          {WORDS.map((w, i) => (
            <span key={w} className="inline-block overflow-hidden px-[0.12em]">
              <span data-line className={`inline-block ${i === WORDS.length - 1 ? "italic text-gold-soft" : ""}`}>
                {w}
              </span>
            </span>
          ))}
        </h2>
      </div>

      {/* Bottom counter + progress */}
      <div className="relative px-6 pb-9 sm:px-12">
        <div className="flex items-end justify-between">
          <span data-meta className="eyebrow text-[#f5ecda]/50">Raising the curtain</span>
          <span className="font-display font-medium tabular-nums leading-none text-4xl sm:text-6xl">
            <span ref={counter}>00</span>
            <span className="text-gold-soft"> %</span>
          </span>
        </div>
        <span className="relative mt-5 block h-px w-full overflow-hidden bg-[#f5ecda]/15">
          <span ref={bar} className="absolute inset-y-0 left-0 w-full origin-left scale-x-0 bg-gradient-to-r from-gold-deep via-gold-soft to-gold" />
        </span>
      </div>
    </div>
  );
}

const SPARKS = [
  { x: "12%", y: "26%", s: 4, d: 0 },
  { x: "82%", y: "22%", s: 5, d: 0.6 },
  { x: "24%", y: "62%", s: 3, d: 1.1 },
  { x: "70%", y: "66%", s: 4, d: 0.3 },
  { x: "50%", y: "18%", s: 3, d: 0.9 },
  { x: "90%", y: "50%", s: 3, d: 1.4 },
  { x: "8%", y: "48%", s: 4, d: 0.5 },
];

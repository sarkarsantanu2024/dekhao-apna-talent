"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const WORDS = ["Dekhao", "Apna", "Talent"];

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
        if (counter.current) counter.current.textContent = String(Math.round(count.v));
      };

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        count.v = 100;
        setCount();
        gsap.set([...lines, ...meta, bar.current], { clearProps: "all" });
        gsap.to(root.current, {
          autoAlpha: 0,
          duration: 0.4,
          delay: 0.4,
          onComplete: () => setMounted(false),
        });
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
          gsap
            .timeline({ onComplete: () => setMounted(false) })
            .to(lines, { yPercent: -110, duration: 0.55, ease: "power3.in", stagger: 0.07 })
            .to(meta, { opacity: 0, duration: 0.3 }, "<")
            .to(
              root.current,
              { yPercent: -100, duration: 0.9, ease: "power4.inOut" },
              "-=0.15"
            );
        },
      });

      tl
        // meta (top + bottom labels) fade/slide in
        .from(meta, { yPercent: 120, opacity: 0, duration: 0.5, stagger: 0.08 })
        // headline words mask up into view
        .from(
          lines,
          { yPercent: 115, duration: 0.8, ease: "power4.out", stagger: 0.1 },
          "-=0.25"
        )
        // count 0 -> 100, synced with the fill bar
        .to(
          count,
          { v: 100, duration: 1.6, ease: "power2.inOut", onUpdate: setCount },
          "-=0.5"
        )
        .to(
          bar.current,
          { scaleX: 1, duration: 1.6, ease: "power2.inOut" },
          "<"
        );
    },
    { scope: root }
  );

  if (!mounted) return null;

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[100] flex flex-col bg-band-butter text-foreground"
    >
      {/* Top meta row */}
      <div className="flex items-center justify-between px-6 pt-8 sm:px-10">
        <span className="overflow-hidden">
          <span data-meta className="flex items-center gap-2 font-fun text-sm font-semibold text-crayon-grape">
            <span className="material-symbols-rounded text-crayon-coral" style={{ fontSize: 20 }}>auto_awesome</span>
            Mind Mantra Abacus
          </span>
        </span>
        <span className="overflow-hidden">
          <span data-meta className="block font-fun text-sm font-semibold text-crayon-coral">
            2026
          </span>
        </span>
      </div>

      {/* Masked headline */}
      <div className="flex flex-1 items-center px-6 sm:px-10">
        <h2 className="font-display font-extrabold leading-[0.9] tracking-tight text-[15vw] sm:text-[11vw]">
          {WORDS.map((w, i) => (
            <span key={w} className="block overflow-hidden">
              <span
                data-line
                className={`block ${i === WORDS.length - 1 ? "text-crayon-coral" : ""}`}
              >
                {w}
              </span>
            </span>
          ))}
        </h2>
      </div>

      {/* Bottom counter + progress bar */}
      <div className="px-6 pb-8 sm:px-10">
        <div className="flex items-end justify-between">
          <span className="overflow-hidden">
            <span data-meta className="block font-fun text-sm font-semibold text-muted-foreground">
              Loading the fun…
            </span>
          </span>
          <span className="font-display font-extrabold tabular-nums leading-none text-5xl sm:text-7xl">
            <span ref={counter}>0</span>
            <span className="text-crayon-coral">%</span>
          </span>
        </div>
        <span className="relative mt-5 block h-2 w-full overflow-hidden rounded-full bg-card">
          <span
            ref={bar}
            className="absolute inset-y-0 left-0 w-full origin-left scale-x-0 rounded-full bg-crayon-coral"
          />
        </span>
      </div>
    </div>
  );
}

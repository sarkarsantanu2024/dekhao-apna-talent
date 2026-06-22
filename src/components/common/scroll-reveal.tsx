"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Props = {
  children: ReactNode;
  /** Stagger child elements (direct descendants with [data-reveal-item]). Otherwise reveals the wrapper itself. */
  stagger?: boolean;
  /** Vertical offset to animate from (px). */
  y?: number;
  /** Delay before the reveal starts. */
  delay?: number;
  className?: string;
};

export function ScrollReveal({ children, stagger = false, y = 30, delay = 0, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      const targets = stagger
        ? ref.current.querySelectorAll<HTMLElement>("[data-reveal-item]")
        : [ref.current];
      if (targets.length === 0) return;

      gsap.from(targets, {
        autoAlpha: 0,
        // Rows of staggered items fade in WITHOUT vertical movement, so cards
        // in a grid stay perfectly top-aligned throughout the reveal. A single
        // (non-stagger) target keeps the gentle rise.
        y: stagger ? 0 : y,
        duration: stagger ? 0.7 : 0.9,
        ease: "power3.out",
        delay,
        stagger: stagger ? 0.1 : 0,
        scrollTrigger: {
          trigger: ref.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });
    },
    { scope: ref, dependencies: [stagger, y, delay] },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

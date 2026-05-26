"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  /** How much the element drifts toward the cursor (px at max distance). */
  strength?: number;
  /** Radius (px) inside which the magnet activates. */
  radius?: number;
};

/**
 * Wraps a clickable element and softly pulls it toward the cursor when nearby.
 * Disables itself on touch / reduced-motion.
 */
export function Magnetic({ children, strength = 16, radius = 120, className, ...rest }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return; // touch — skip

    const el = ref.current;
    const inner = el.firstElementChild as HTMLElement | null;
    if (!inner) return;

    let raf = 0;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > radius) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => gsap.to(inner, { x: 0, y: 0, duration: 0.6, ease: "power3.out" }));
        return;
      }
      const pull = 1 - dist / radius;
      gsap.to(inner, {
        x: (dx / radius) * strength * pull,
        y: (dy / radius) * strength * pull,
        duration: 0.4,
        ease: "power3.out",
      });
    };
    const onLeave = () => gsap.to(inner, { x: 0, y: 0, duration: 0.6, ease: "power3.out" });

    window.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [strength, radius]);

  return (
    <div ref={ref} className={className} {...rest}>
      <div className="will-change-transform">{children}</div>
    </div>
  );
}

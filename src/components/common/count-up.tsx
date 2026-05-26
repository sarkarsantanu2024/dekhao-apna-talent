"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Props = {
  to: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  locale?: string;
  className?: string;
};

export function CountUp({
  to,
  prefix = "",
  suffix = "",
  duration = 1.6,
  locale = "en-IN",
  className,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      const node = ref.current;
      const obj = { v: 0 };

      gsap.to(obj, {
        v: to,
        duration,
        ease: "power2.out",
        scrollTrigger: {
          trigger: node,
          start: "top 85%",
          toggleActions: "play none none none",
        },
        onUpdate: () => {
          node.textContent = `${prefix}${Math.round(obj.v).toLocaleString(locale)}${suffix}`;
        },
      });
    },
    { scope: ref, dependencies: [to, prefix, suffix, duration, locale] },
  );

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  );
}

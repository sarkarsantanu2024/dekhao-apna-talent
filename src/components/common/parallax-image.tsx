"use client";

import Image, { type ImageProps } from "next/image";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Props = Omit<ImageProps, "fill" | "width" | "height"> & {
  amount?: number;
  containerClassName?: string;
};

export function ParallaxImage({
  amount = 15,
  containerClassName = "",
  className,
  alt,
  ...img
}: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!wrap.current || !inner.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.fromTo(
        inner.current,
        { yPercent: -amount },
        {
          yPercent: amount,
          ease: "none",
          scrollTrigger: {
            trigger: wrap.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    },
    { scope: wrap, dependencies: [amount] },
  );

  return (
    <div ref={wrap} className={`relative overflow-hidden ${containerClassName}`}>
      <div ref={inner} className="absolute inset-x-0 -inset-y-[15%]">
        <Image alt={alt} fill className={className} {...img} />
      </div>
    </div>
  );
}

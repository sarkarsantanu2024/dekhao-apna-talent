"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export function PageLoader() {
  const root = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const [mounted, setMounted] = useState(true);

  useGSAP(
    () => {
      const count = { v: 0 };
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
          gsap.to(root.current, {
            yPercent: -100,
            duration: 0.8,
            ease: "power3.inOut",
            delay: 0.15,
            onComplete: () => setMounted(false),
          });
        },
      });
      tl.from(title.current, { y: 24, opacity: 0, duration: 0.6 })
        .to(count, {
          v: 100,
          duration: 1.2,
          ease: "power2.inOut",
          onUpdate: () => {
            if (counter.current) counter.current.textContent = String(Math.round(count.v)).padStart(2, "0");
          },
        }, "-=0.15")
        .from(bar.current, { scaleX: 0, transformOrigin: "left center", duration: 1.2, ease: "power2.inOut" }, "<");
    },
    { scope: root },
  );

  if (!mounted) return null;

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[100] flex flex-col justify-end bg-black text-white"
    >
      <div className="container mx-auto flex items-end justify-between gap-6 px-6 pb-10">
        <span ref={title} className="text-3xl font-black uppercase leading-none tracking-tight sm:text-5xl">
          Dekhao Apna <span className="text-[#FF5A1F]">Talent</span>
        </span>
        <span className="font-mono text-xs uppercase tracking-wider text-white/60">
          <span ref={counter}>00</span>%
        </span>
      </div>
      <span className="relative block h-px w-full overflow-hidden bg-white/10">
        <span ref={bar} className="absolute inset-y-0 left-0 w-full bg-[#FF5A1F]" />
      </span>
    </div>
  );
}

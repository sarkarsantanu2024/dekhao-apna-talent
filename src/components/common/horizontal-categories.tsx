"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { CATEGORIES } from "@/constants";
import { CATEGORY_IMAGES } from "@/constants/media";
import { Icon } from "./icon";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const ICONS: Record<string, string> = {
  dance: "auto_awesome",
  song: "music_note",
  "mental-math": "calculate",
  "other-talent": "star",
};

/**
 * Horizontal pinned-scroll section: while the section is in view, the page
 * "freezes" vertically and the card track translates left as the user scrolls.
 */
export function HorizontalCategories() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!root.current || !track.current) return;
      if (window.matchMedia("(max-width: 768px)").matches) return; // mobile: fall through to vertical
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const distance = () => {
        const rect = track.current!.getBoundingClientRect();
        const inset = 24;
        return Math.max(0, rect.right - window.innerWidth + inset);
      };

      gsap.to(track.current, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="relative overflow-hidden border-t border-white/10 py-24 sm:py-32 md:h-[100svh] md:py-0"
    >
      <div className="container mx-auto flex h-full flex-col justify-center px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-3">
              <span className="font-mono text-[#FF5A1F]">02</span>
              <span className="h-px w-10 bg-white/30" />
              <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/70">Categories</span>
            </div>
            <h2 className="mt-4 max-w-2xl text-3xl font-black uppercase leading-[1.05] tracking-tight sm:text-5xl">
              Pick your stage.
            </h2>
          </div>
          <p className="hidden text-[11px] uppercase tracking-[0.22em] text-white/40 md:block">
            Scroll →
          </p>
        </div>

        {/* Track — vertical stack on mobile, horizontal pinned scroll on md+ */}
        <div
          ref={track}
          className="mt-12 flex flex-col gap-4 md:mt-16 md:w-max md:flex-row md:gap-6"
        >
          {CATEGORIES.map((c, i) => {
            const iconName = ICONS[c.slug];
            const bg = CATEGORY_IMAGES[c.slug];
            return (
              <article
                key={c.slug}
                className="group relative flex w-full min-h-[420px] flex-col justify-between overflow-hidden rounded-2xl border border-white/10 p-7 sm:min-h-[460px] sm:p-8 md:h-[480px] md:w-[440px]"
              >
                {/* Themed backdrop */}
                {bg && (
                  <Image
                    src={bg}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 440px"
                    className="-z-10 object-cover opacity-40 transition-all duration-700 group-hover:scale-105 group-hover:opacity-60"
                  />
                )}
                <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-black/40 via-black/65 to-black" />
                <div aria-hidden className="absolute inset-0 -z-10 bg-black/20 transition-colors duration-500 group-hover:bg-black/10" />

                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-white/60">0{i + 1}</span>
                    <Icon
                      name="arrow_outward"
                      size={18}
                      className="text-white/50 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#FF5A1F]"
                    />
                  </div>
                  <Icon name={iconName} size={40} className="mt-8 text-[#FF5A1F] md:mt-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight sm:text-3xl md:text-4xl">{c.name}</h3>
                  <p className="mt-3 text-sm text-white/75 md:text-base">{c.blurb}</p>
                  <div className="mt-6 flex items-baseline justify-between border-t border-white/15 pt-4 md:mt-8">
                    <span className="text-[11px] uppercase tracking-wider text-white/60">Fee</span>
                    <span className="font-bold text-white">₹{c.fee}</span>
                  </div>
                </div>
              </article>
            );
          })}

          {/* Tail card */}
          <article className="flex w-full min-h-[220px] flex-col items-start justify-center rounded-2xl border border-[#FF5A1F]/30 bg-[#FF5A1F]/5 p-8 sm:min-h-[280px] md:h-[480px] md:w-[440px] md:p-10">
            <span className="font-mono text-xs text-[#FF5A1F]">05</span>
            <h3 className="mt-6 text-2xl font-black uppercase leading-tight tracking-tight sm:text-3xl md:mt-10 md:text-4xl">
              Ready to <br />
              <span className="text-[#FF5A1F]">enter?</span>
            </h3>
            <a
              href="/register"
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white hover:text-[#FF5A1F] md:mt-auto"
            >
              Register your centre <Icon name="arrow_outward" size={16} />
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}

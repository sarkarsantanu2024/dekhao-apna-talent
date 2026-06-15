"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { CATEGORIES } from "@/constants";
import { CATEGORY_IMAGES } from "@/constants/media";
import { Icon } from "./icon";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const META: Record<string, { icon: string; tint: string; chip: string; ring: string }> = {
  dance:          { icon: "music_note",   tint: "bg-crayon-coral/12", chip: "bg-crayon-coral",  ring: "border-crayon-coral/30" },
  song:           { icon: "mic",          tint: "bg-crayon-grape/12", chip: "bg-crayon-grape",  ring: "border-crayon-grape/30" },
  "mental-math":  { icon: "calculate",    tint: "bg-crayon-sky/12",   chip: "bg-crayon-sky",    ring: "border-crayon-sky/30" },
  "other-talent": { icon: "auto_awesome", tint: "bg-crayon-mint/12",  chip: "bg-crayon-mint",   ring: "border-crayon-mint/30" },
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
      if (window.matchMedia("(max-width: 768px)").matches) return; // mobile: vertical
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
      className="relative overflow-hidden bg-band-butter py-20 sm:py-28 md:h-[100svh] md:py-0"
    >
      <div className="container mx-auto flex h-full flex-col justify-center px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-1.5 shadow-pop-sm">
              <span className="material-symbols-rounded text-crayon-coral" style={{ fontSize: 18, fontVariationSettings: "'FILL' 0" }}>category</span>
              <span className="font-fun text-base font-semibold text-crayon-grape">Pick your stage</span>
            </div>
            <h2 className="mt-4 max-w-2xl text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
              What will <span className="text-gradient">you</span> show us?
            </h2>
          </div>
          <p className="hidden font-fun text-sm font-semibold text-muted-foreground md:block">
            Scroll to explore →
          </p>
        </div>

        {/* Track — vertical stack on mobile, horizontal pinned scroll on md+ */}
        <div
          ref={track}
          className="mt-10 flex flex-col gap-5 md:mt-14 md:w-max md:flex-row md:gap-6"
        >
          {CATEGORIES.map((c, i) => {
            const m = META[c.slug] ?? META.dance;
            const bg = CATEGORY_IMAGES[c.slug];
            return (
              <Link
                key={c.slug}
                href="/categories"
                className={`group lift relative flex w-full flex-col overflow-hidden rounded-3xl border-2 ${m.ring} bg-card p-4 shadow-pop md:h-[480px] md:w-[380px]`}
              >
                {/* image window */}
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl">
                  {bg && (
                    <Image
                      src={bg}
                      alt={c.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 380px"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  )}
                  <span className={`absolute left-3 top-3 inline-flex size-12 items-center justify-center rounded-2xl ${m.chip} text-white shadow-pop-sm`}>
                    <span className="material-symbols-rounded" style={{ fontSize: 26, fontVariationSettings: "'FILL' 0" }}>{m.icon}</span>
                  </span>
                  <span className="absolute right-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-extrabold text-foreground shadow-pop-sm backdrop-blur">
                    0{i + 1}
                  </span>
                </div>

                <div className={`mt-4 flex flex-1 flex-col rounded-2xl ${m.tint} p-5`}>
                  <h3 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{c.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground md:text-base">{c.blurb}</p>
                  <div className="mt-auto flex items-center justify-between pt-5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-sm font-bold text-foreground shadow-pop-sm">
                      <span className="material-symbols-rounded text-crayon-mint" style={{ fontSize: 18, fontVariationSettings: "'FILL' 0" }}>confirmation_number</span>
                      ₹{c.fee}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-crayon-grape">
                      Pick this
                      <Icon name="arrow_forward" size={16} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}

          {/* Tail card */}
          <article className="flex w-full flex-col items-start justify-center rounded-3xl bg-brand-gradient p-8 text-white shadow-pop md:h-[480px] md:w-[360px] md:p-10">
            <span className="material-symbols-rounded animate-wiggle" style={{ fontSize: 48, fontVariationSettings: "'FILL' 0" }}>rocket_launch</span>
            <h3 className="mt-6 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              Ready to<br />shine?
            </h3>
            <p className="mt-3 text-white/85">Join through your nearest Mind Mantra centre and grab your chest card!</p>
            <Link
              href="/contact"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-card px-5 py-3 text-sm font-bold text-crayon-grape transition-transform hover:-translate-y-0.5"
            >
              Find a centre <Icon name="arrow_forward" size={16} />
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}

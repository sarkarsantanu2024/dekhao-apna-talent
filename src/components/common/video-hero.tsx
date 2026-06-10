"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Button } from "@/components/ui/button";
import { HERO_VIDEO } from "@/constants/media";
import { EVENT_YEAR } from "@/constants";
import { Magnetic } from "./magnetic";
import { Icon } from "./icon";
import { Decor } from "./decor";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function VideoHero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.5 });
      tl.from("[data-hero-meta]", { y: 18, opacity: 0, duration: 0.6 })
        .from("[data-hero-char]", { yPercent: 110, duration: 0.9, stagger: 0.025, ease: "power3.out" }, "-=0.2")
        .from("[data-hero-ghost]", { yPercent: 30, opacity: 0, duration: 1.2, ease: "power3.out" }, "<")
        .from("[data-hero-sub]",  { y: 18, opacity: 0, duration: 0.6 }, "-=0.55")
        .from("[data-hero-cta]",  { y: 18, opacity: 0, duration: 0.55, stagger: 0.08 }, "-=0.35")
        .from("[data-hero-foot]", { opacity: 0, duration: 0.6 }, "-=0.3");

      gsap.to("[data-hero-video]", {
        yPercent: 18,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: root },
  );

  const line1 = "Dekhao Apna";
  const line2 = "Talent.";

  return (
    <section
      ref={root}
      className="relative isolate h-[100svh] min-h-[640px] w-full overflow-hidden bg-black text-white"
    >
      <video
        data-hero-video
        className="absolute inset-x-0 -inset-y-[10%] -z-20 h-[120%] w-full object-cover opacity-55"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster={HERO_VIDEO.poster}
      >
        <source src={HERO_VIDEO.src} type="video/mp4" />
      </video>

      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-black/55 via-black/35 to-black" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_82%_18%,rgba(168,85,247,0.30),transparent_55%),radial-gradient(circle_at_12%_88%,rgba(236,72,153,0.18),transparent_55%)]" />
      <Decor blobs={false} className="-z-10" />

      <div
        data-hero-ghost
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-[8%] -z-10 select-none text-center text-[26vw] font-black uppercase leading-none tracking-tighter text-white/[0.045] sm:bottom-[6%]"
      >
        Talent
      </div>

      <div data-hero-meta className="absolute inset-x-0 top-24 z-10 hidden md:block">
        <div className="container mx-auto flex items-center justify-between px-6 text-[11px] uppercase tracking-[0.22em] text-white/60">
          <span>Eastern India · National Stage</span>
          <span className="inline-flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-[#A855F7]" />
            Edition {EVENT_YEAR}
          </span>
        </div>
      </div>

      <div className="relative z-10 flex h-full flex-col justify-center px-6 sm:px-10">
        <div className="container mx-auto">
          <h1 className="font-black uppercase leading-[0.92] tracking-tight">
            <SplitLine
              text={line1}
              className="block text-[15vw] sm:text-[12vw] md:text-[10vw] lg:text-[8.5vw]"
            />
            <SplitLine
              text={line2}
              accent
              className="block text-[15vw] sm:text-[12vw] md:text-[10vw] lg:text-[8.5vw]"
            />
          </h1>

          <p data-hero-sub className="mt-6 max-w-xl text-base text-white/75 sm:text-lg">
            A national-stage talent contest for ages 6–14. Dance, song, mental math &amp; more — judged by stars of Bengali television.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Magnetic data-hero-cta>
              <Button
                asChild
                size="lg"
                className="group h-12 px-7 font-bold uppercase tracking-wider"
              >
                <Link href="/register" className="inline-flex items-center gap-2">
                  Register your centre
                  <Icon name="south_east" size={18} className="transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
                </Link>
              </Button>
            </Magnetic>
            <Magnetic data-hero-cta>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 border-white/25 bg-transparent px-6 font-bold uppercase tracking-wider text-white hover:bg-white/5 hover:text-white"
              >
                <Link href="/gallery" className="inline-flex items-center gap-2">
                  <Icon name="play_arrow" size={20} filled />
                  Watch the reel
                </Link>
              </Button>
            </Magnetic>
          </div>
        </div>
      </div>

      <div
        data-hero-foot
        className="absolute inset-x-0 bottom-0 z-10 border-t border-white/10 bg-black/30 backdrop-blur"
      >
        <div className="container mx-auto flex items-center justify-between gap-6 px-6 py-4 text-[11px] uppercase tracking-[0.22em] text-white/55 sm:text-xs">
          <span className="hidden sm:inline">Scroll to explore</span>
          <span>Top prize <span className="text-white">₹5,000</span></span>
          <span className="hidden md:inline">Finale · Kolkata</span>
          <span>Ages <span className="text-white">6 – 14</span></span>
        </div>
      </div>
    </section>
  );
}

function SplitLine({ text, accent = false, className }: { text: string; accent?: boolean; className?: string }) {
  // The accent word renders as ONE gradient unit — `background-clip: text`
  // can't paint a gradient through per-letter inline-block spans (it goes
  // invisible), so we keep the gradient on a single leaf and animate it whole.
  if (accent) {
    return (
      <span className={className ?? ""}>
        <span className="inline-block overflow-hidden align-bottom">
          <span data-hero-char className="inline-block text-gradient will-change-transform">
            {text}
          </span>
        </span>
      </span>
    );
  }
  return (
    <span className={className ?? ""}>
      {Array.from(text).map((ch, i) =>
        ch === " " ? (
          <span key={i} className="inline-block w-[0.28em]" aria-hidden />
        ) : (
          <span key={i} className="inline-block overflow-hidden align-bottom">
            <span data-hero-char className="inline-block will-change-transform">
              {ch}
            </span>
          </span>
        )
      )}
    </span>
  );
}

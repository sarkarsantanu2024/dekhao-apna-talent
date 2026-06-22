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
import { Doodles } from "./playful";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const CHIPS = [
  { icon: "cake", label: "Ages 6–14", color: "text-crayon-coral" },
  { icon: "redeem", label: "₹5,000 top prize", color: "text-crayon-grape" },
  { icon: "storefront", label: "200+ centres", color: "text-crayon-sky" },
];

export function VideoHero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.4 });
      tl.from("[data-hero-eyebrow]", { y: 18, opacity: 0, duration: 0.5 })
        .from("[data-hero-char]", { yPercent: 110, duration: 0.8, stagger: 0.025 }, "-=0.1")
        .from("[data-hero-sub]", { y: 18, opacity: 0, duration: 0.55 }, "-=0.4")
        .from("[data-hero-chip]", { y: 14, opacity: 0, duration: 0.4, stagger: 0.08 }, "-=0.3")
        .from("[data-hero-cta]", { y: 16, opacity: 0, duration: 0.45, stagger: 0.08 }, "-=0.25")
        .from("[data-hero-tv]", { scale: 0.85, opacity: 0, duration: 0.7, ease: "back.out(1.6)" }, "-=0.8");
    },
    { scope: root },
  );

  const line1 = "Dekhao Apna";
  const line2 = "Talent!";

  return (
    <section
      ref={root}
      className="relative isolate overflow-hidden bg-band-butter pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-40 lg:pb-28"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_88%_12%,rgba(255,200,61,0.3),transparent_45%),radial-gradient(circle_at_8%_85%,rgba(77,168,255,0.22),transparent_50%)]"
      />
      <Doodles className="-z-10" />

      <div className="container relative mx-auto grid items-center gap-12 px-6 lg:grid-cols-2">
        {/* Left — copy */}
        <div className="pt-12 lg:pt-0">
          <div
            data-hero-eyebrow
            className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 shadow-pop-sm"
          >
            <span className="material-symbols-rounded text-crayon-sun animate-wiggle" style={{ fontSize: 20, fontVariationSettings: "'FILL' 0" }}>
              auto_awesome
            </span>
            <span className="font-fun text-sm font-semibold text-crayon-grape">
              Eastern India · Edition {EVENT_YEAR}
            </span>
          </div>

          <h1 className="mt-6 font-extrabold leading-[0.95] tracking-tight">
            <SplitLine text={line1} className="block text-5xl sm:text-6xl md:text-7xl" />
            <SplitLine text={line2} accent className="block text-6xl sm:text-7xl md:text-8xl" />
          </h1>

          <p data-hero-sub className="mt-6 max-w-md text-lg text-muted-foreground sm:text-xl">
            A super-fun talent stage for kids 6–14! Dance, sing, do mind-math or show your own special skill — and shine in front of star judges. 🌟
          </p>

          <div className="mt-7 flex flex-wrap gap-2.5">
            {CHIPS.map((c) => (
              <span
                key={c.label}
                data-hero-chip
                className="inline-flex items-center gap-2 rounded-full border-2 border-border bg-card px-4 py-2 text-sm font-bold text-foreground shadow-pop-sm"
              >
                <span className={`material-symbols-rounded ${c.color}`} style={{ fontSize: 20, fontVariationSettings: "'FILL' 0" }}>
                  {c.icon}
                </span>
                {c.label}
              </span>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Magnetic data-hero-cta>
              <Button asChild variant="fun" size="xl" className="group">
                <Link href="/gallery" className="inline-flex items-center gap-2">
                  <Icon name="play_circle" size={22} filled />
                  Watch the fun
                </Link>
              </Button>
            </Magnetic>
            <Magnetic data-hero-cta>
              <Button asChild variant="outline" size="xl" className="font-display font-bold">
                <Link href="/categories" className="inline-flex items-center gap-2">
                  Explore categories
                  <Icon name="arrow_forward" size={20} />
                </Link>
              </Button>
            </Magnetic>
          </div>
        </div>

        {/* Right — video in a chunky sticker frame */}
        <div data-hero-tv className="relative mx-auto w-full max-w-xl lg:max-w-none">
          {/* floating sticker accents */}
          <span aria-hidden className="absolute -left-4 -top-5 z-10 inline-flex size-14 items-center justify-center rounded-2xl bg-crayon-sun text-foreground shadow-pop animate-bob">
            <span className="material-symbols-rounded" style={{ fontSize: 28, fontVariationSettings: "'FILL' 0" }}>music_note</span>
          </span>
          <span aria-hidden className="absolute -right-3 top-1/3 z-10 inline-flex size-12 items-center justify-center rounded-full bg-crayon-coral text-white shadow-pop animate-bob" style={{ animationDelay: "0.8s" }}>
            <span className="material-symbols-rounded" style={{ fontSize: 24, fontVariationSettings: "'FILL' 0" }}>favorite</span>
          </span>
          <span aria-hidden className="absolute -bottom-4 left-10 z-10 inline-flex size-12 items-center justify-center rounded-2xl bg-crayon-sky text-white shadow-pop animate-bob" style={{ animationDelay: "1.4s" }}>
            <span className="material-symbols-rounded" style={{ fontSize: 24, fontVariationSettings: "'FILL' 0" }}>star</span>
          </span>

          <div className="relative overflow-hidden rounded-[2rem] border-4 border-card bg-foreground">
            <video
              className="aspect-[4/5] w-full object-cover sm:aspect-video lg:aspect-[5/4]"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              poster={HERO_VIDEO.poster}
            >
              <source src={HERO_VIDEO.src} type="video/mp4" />
            </video>
            <div aria-hidden className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/20" />
            <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-background/90 px-3 py-1.5 text-xs font-bold text-foreground shadow-pop-sm backdrop-blur">
              <span className="size-2 animate-twinkle rounded-full bg-crayon-coral" />
              Finale highlights
            </span>
          </div>
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
        <span className="inline-block overflow-hidden align-bottom pb-2">
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

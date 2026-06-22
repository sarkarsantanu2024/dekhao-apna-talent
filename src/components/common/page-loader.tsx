"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const WORDS = ["Dekhao", "Apna", "Talent"];

/* Saffron-gold confetti (Indian saffron · marigold · amber · cream).
   Deterministic specs → no hydration mismatch. */
const CONFETTI_COLORS = ["#ff9933", "#f4a124", "#fbbf24", "#f59e0b", "#f3c34c", "#fff1c4", "#e6a532", "#d6692e"];
const CONFETTI = Array.from({ length: 58 }, (_, i) => {
  const ang = ((i * 137.5) % 360) * (Math.PI / 180);
  const rad = 130 + (i % 6) * 48;
  return {
    tx: Math.round(Math.cos(ang) * rad),
    ty: Math.round(Math.sin(ang) * rad) - 20,
    rot: ((i * 73) % 720) - 360,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: (i % 10) * 0.022,
    w: 6 + (i % 3) * 3,
    h: 9 + (i % 4) * 4,
  };
});

/* Curved (wavy) ribbon streamers in saffron / amber two-tones. */
const RIBBON_PAIRS = [
  ["#ff9933", "#c2410c"],
  ["#f4a124", "#9a3412"],
  ["#fbbf24", "#b45309"],
  ["#f3c34c", "#a16207"],
  ["#ffd27a", "#d97706"],
  ["#e6a532", "#854d0e"],
];
const RIBBON_PATHS = [
  "M12 2 C2 14 22 22 12 34 C2 46 22 54 12 68",
  "M12 2 C22 14 2 22 12 34 C22 46 2 54 12 68",
  "M12 3 C4 16 20 26 12 40 C5 52 19 60 12 68",
];
const RIBBONS = Array.from({ length: 22 }, (_, i) => {
  const ang = ((i * 137.5 + 40) % 360) * (Math.PI / 180);
  const rad = 100 + (i % 5) * 38;
  return {
    tx: Math.round(Math.cos(ang) * rad),
    ty: Math.round(Math.sin(ang) * rad) - 30,
    rot: ((i * 91) % 540) - 270,
    pair: RIBBON_PAIRS[i % RIBBON_PAIRS.length],
    path: RIBBON_PATHS[i % RIBBON_PATHS.length],
    delay: (i % 6) * 0.04,
    w: 12 + (i % 3) * 3,
    h: 32 + (i % 4) * 8,
    flutter: 0.5 + (i % 4) * 0.09,
  };
});

/* Falling sparkle glitter streaming through the spotlight. */
const GLITTER = Array.from({ length: 32 }, (_, i) => ({
  left: `${14 + ((i * 137) % 72)}%`,
  size: 3 + (i % 3),
  fall: 300 + (i % 6) * 40,
  dur: 2.6 + (i % 5) * 0.42,
  delay: (i * 0.37) % 4,
}));

/* Hand-placed realistic sparkle fountain above the cup (varied sizes). */
const SPARKLES = [
  { l: 50, t: -9, s: 26 }, { l: 42, t: 1, s: 15 }, { l: 58, t: -1, s: 18 },
  { l: 36, t: 11, s: 12 }, { l: 64, t: 9, s: 13 }, { l: 50, t: 15, s: 10 },
  { l: 31, t: 21, s: 9 }, { l: 69, t: 19, s: 11 }, { l: 46, t: -3, s: 12 },
  { l: 55, t: 7, s: 9 }, { l: 25, t: 5, s: 8 }, { l: 75, t: 3, s: 9 },
];

/** A realistic gold "WIN" trophy — metallic cup with a number 1, curved
 *  handles, a knobbed stem and a pedestal with a dark band. */
function Trophy({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 380" className={className} aria-hidden>
      <defs>
        <linearGradient id="cup" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#9c6a16" />
          <stop offset="0.16" stopColor="#f4d678" />
          <stop offset="0.4" stopColor="#fff3c8" />
          <stop offset="0.52" stopColor="#efc05c" />
          <stop offset="0.72" stopColor="#d99f2f" />
          <stop offset="0.86" stopColor="#a9781d" />
          <stop offset="1" stopColor="#7c530f" />
        </linearGradient>
        <linearGradient id="metal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff0bf" />
          <stop offset="0.45" stopColor="#e9b948" />
          <stop offset="1" stopColor="#9a6a18" />
        </linearGradient>
        <radialGradient id="knob" cx="0.38" cy="0.32" r="0.72">
          <stop offset="0" stopColor="#fff3cf" />
          <stop offset="0.5" stopColor="#e3a836" />
          <stop offset="1" stopColor="#92611a" />
        </radialGradient>
        <linearGradient id="baseTop" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#a8741c" />
          <stop offset="0.5" stopColor="#ffe6a0" />
          <stop offset="1" stopColor="#a8741c" />
        </linearGradient>
        <radialGradient id="cupGloss" cx="0.34" cy="0.2" r="0.5">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.7" />
          <stop offset="0.55" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <path d="M72 92 C18 86 18 180 98 190 L98 173 C48 163 52 106 86 110 Z" fill="url(#metal)" />
      <path d="M228 92 C282 86 282 180 202 190 L202 173 C252 163 248 106 214 110 Z" fill="url(#metal)" />

      <ellipse cx="150" cy="70" rx="79" ry="14" fill="#f4d678" />
      <path d="M71 70 C71 156 104 213 150 215 C196 213 229 156 229 70 Z" fill="url(#cup)" />
      <path d="M71 70 C71 156 104 213 150 215 C196 213 229 156 229 70 Z" fill="url(#cupGloss)" />
      <path d="M104 82 C100 142 112 190 126 206" fill="none" stroke="#fff6dc" strokeWidth="7" strokeLinecap="round" opacity="0.45" />
      <ellipse cx="150" cy="70" rx="79" ry="14" fill="none" stroke="#fff0bf" strokeWidth="2" opacity="0.6" />

      <text x="150" y="160" textAnchor="middle" fontFamily="Georgia, serif" fontSize="96" fontWeight="700" fill="#5a2c0a">1</text>

      <path d="M138 215 L162 215 L158 231 L142 231 Z" fill="url(#metal)" />
      <ellipse cx="150" cy="243" rx="19" ry="16" fill="url(#knob)" />
      <ellipse cx="150" cy="263" rx="30" ry="8" fill="url(#metal)" />
      <path d="M140 265 L160 265 L156 287 L144 287 Z" fill="url(#metal)" />

      <path d="M66 292 L66 330 A84 17 0 0 0 234 330 L234 292 A84 17 0 0 1 66 292 Z" fill="#1d150c" />
      <ellipse cx="150" cy="292" rx="84" ry="17" fill="url(#baseTop)" />
      <path d="M66 330 A84 17 0 0 0 234 330" fill="none" stroke="url(#metal)" strokeWidth="5" />
      <text
        x="150" y="324" textAnchor="middle"
        fontFamily="var(--font-fun), Arial, sans-serif" fontSize="30" fontWeight="800" letterSpacing="3"
        fill="url(#baseTop)"
      >
        WIN
      </text>
    </svg>
  );
}

/** One celebratory burst — saffron confetti squares + curved ribbon streamers
 *  exploding from the cup. Re-keyed by the loader to replay. */
function Burst() {
  return (
    <div aria-hidden className="pointer-events-none absolute left-1/2 top-[20%] z-30">
      {CONFETTI.map((c, i) => (
        <span
          key={`c${i}`}
          className="confetti-piece"
          style={{
            width: c.w,
            height: c.h,
            background: c.color,
            animationDelay: `${c.delay}s`,
            ["--tx" as string]: `${c.tx}px`,
            ["--ty" as string]: `${c.ty}px`,
            ["--rot" as string]: `${c.rot}deg`,
          }}
        />
      ))}
      {RIBBONS.map((r, i) => (
        <span
          key={`r${i}`}
          className="confetti-piece"
          style={{
            width: r.w,
            height: r.h,
            animationDelay: `${r.delay}s`,
            animationDuration: "2.8s",
            ["--tx" as string]: `${r.tx}px`,
            ["--ty" as string]: `${r.ty}px`,
            ["--rot" as string]: `${r.rot}deg`,
          }}
        >
          <svg viewBox="0 0 24 70" preserveAspectRatio="none" className="ribbon-inner" style={{ animationDuration: `${r.flutter}s` }}>
            <defs>
              <linearGradient id={`rg${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={r.pair[0]} />
                <stop offset="1" stopColor={r.pair[1]} />
              </linearGradient>
            </defs>
            <path d={r.path} fill="none" stroke={`url(#rg${i})`} strokeWidth="6" strokeLinecap="round" />
          </svg>
        </span>
      ))}
    </div>
  );
}

/**
 * Intro: a spotlit teal stage with a realistic gold WIN trophy, soft light
 * rays, a sparkle fountain, falling glitter and a saffron confetti-and-ribbon
 * burst — then the serif wordmark rises and the curtain lifts away.
 */
export function PageLoader() {
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [mounted, setMounted] = useState(true);
  const [burstKey, setBurstKey] = useState(0);

  useGSAP(
    () => {
      const lines = gsap.utils.toArray<HTMLElement>("[data-line]");
      const meta = gsap.utils.toArray<HTMLElement>("[data-meta]");
      const count = { v: 0 };
      const setCount = () => {
        if (counter.current) counter.current.textContent = String(Math.round(count.v)).padStart(2, "0");
      };
      const fireBurst = () => setBurstKey((k) => k + 1);

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        count.v = 100;
        setCount();
        fireBurst();
        gsap.set([...lines, ...meta, bar.current, "[data-award]"], { clearProps: "all" });
        gsap.to(root.current, { autoAlpha: 0, duration: 0.4, delay: 0.6, onComplete: () => setMounted(false) });
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
          gsap
            .timeline({ onComplete: () => setMounted(false) })
            .to("[data-award]", { scale: 1.16, autoAlpha: 0, duration: 0.6, ease: "power2.in" })
            .to(lines, { yPercent: -120, duration: 0.6, ease: "power3.in", stagger: 0.06 }, "<")
            .to(meta, { autoAlpha: 0, duration: 0.3 }, "<")
            .to(root.current, { yPercent: -100, duration: 1.1, ease: "power4.inOut" }, "-=0.15");
        },
      });

      tl
        .from("[data-award]", { scale: 0.45, autoAlpha: 0, y: 50, duration: 1.4, ease: "back.out(1.4)" })
        .add(fireBurst, "-=0.5") // first burst as the trophy lands
        .to({}, { duration: 1.4 })
        .from(meta, { y: 16, autoAlpha: 0, duration: 0.6, stagger: 0.1 }, ">-0.2")
        .from(lines, { yPercent: 120, duration: 1.0, ease: "power4.out", stagger: 0.1 }, "-=0.15")
        .add(fireBurst) // second burst as the wordmark lands
        .to(count, { v: 100, duration: 2.5, ease: "power2.inOut", onUpdate: setCount }, "-=0.4")
        .to(bar.current, { scaleX: 1, duration: 2.5, ease: "power2.inOut" }, "<")
        .add(fireBurst, "-=0.4") // final burst near 100%
        .to({}, { duration: 1.1 });
    },
    { scope: root }
  );

  if (!mounted) return null;

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[100] flex flex-col overflow-hidden text-[#f5ecda]"
      style={{ background: "radial-gradient(ellipse at 50% 36%, #2b545d 0%, #173039 44%, #0a161b 100%)" }}
    >
      <span aria-hidden className="ldr-spotlight" />

      <div className="relative z-30 flex items-center justify-between px-6 pt-9 sm:px-12">
        <span data-meta className="eyebrow text-gold-soft/90">Mind Mantra Abacus presents</span>
        <span data-meta className="eyebrow text-[#f5ecda]/55">Est. 2026</span>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center px-6 text-center">
        <span aria-hidden className="ldr-rays" />
        <span aria-hidden className="ldr-halo" />

        {/* falling glitter */}
        <span aria-hidden className="pointer-events-none absolute inset-0 z-20">
          {GLITTER.map((g, i) => (
            <span
              key={i}
              className="ldr-glitter"
              style={{
                left: g.left,
                width: g.size,
                height: g.size,
                ["--fall" as string]: `${g.fall}px`,
                ["--dur" as string]: `${g.dur}s`,
                ["--gd" as string]: `${g.delay}s`,
              }}
            />
          ))}
        </span>

        <div data-award className="relative z-10 mb-10 flex flex-col items-center">
          <div className="ldr-float relative w-[260px] sm:w-[300px]">
            <Trophy className="w-full drop-shadow-[0_28px_38px_rgba(0,0,0,0.55)]" />
            <span aria-hidden className="ldr-gloss absolute inset-0" />

            {/* realistic sparkle fountain above the cup */}
            <span aria-hidden className="pointer-events-none absolute inset-0 z-20">
              {SPARKLES.map((s, i) => (
                <span
                  key={i}
                  className="ldr-sparkle"
                  style={{
                    left: `${s.l}%`,
                    top: `${s.t}%`,
                    width: s.s,
                    height: s.s,
                    ["--tw" as string]: `${1.8 + (i % 5) * 0.3}s`,
                    ["--td" as string]: `${(i % 6) * 0.18}s`,
                  }}
                />
              ))}
            </span>

            {/* saffron confetti + curved ribbon burst (replays via key) */}
            {burstKey > 0 && <Burst key={burstKey} />}
          </div>
          <span aria-hidden className="ldr-floor mx-auto -mt-3 w-[230px]" />
        </div>

        <h2 className="relative z-10 font-display font-semibold leading-[0.95] tracking-[-0.03em] text-[13vw] sm:text-[8.5vw] lg:text-[6.5rem]">
          {WORDS.map((w, i) => (
            <span key={w} className="inline-block overflow-hidden px-[0.12em]">
              <span data-line className={`inline-block ${i === WORDS.length - 1 ? "italic text-gold-soft" : ""}`}>
                {w}
              </span>
            </span>
          ))}
        </h2>
      </div>

      <div className="relative z-30 px-6 pb-9 sm:px-12">
        <div className="flex items-end justify-between">
          <span data-meta className="eyebrow text-[#f5ecda]/50">Raising the curtain</span>
          <span className="font-display font-medium tabular-nums leading-none text-4xl sm:text-6xl">
            <span ref={counter}>00</span>
            <span className="text-gold-soft"> %</span>
          </span>
        </div>
        <span className="relative mt-5 block h-px w-full overflow-hidden bg-[#f5ecda]/15">
          <span ref={bar} className="absolute inset-y-0 left-0 w-full origin-left scale-x-0 bg-gradient-to-r from-gold-deep via-gold-soft to-gold" />
        </span>
      </div>
    </div>
  );
}

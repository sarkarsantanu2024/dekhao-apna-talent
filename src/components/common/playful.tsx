/**
 * Playful building blocks for the kids theme (Skole / KidsCamp inspired):
 *   - <Band>     a full-width section with a soft tinted background and an
 *                optional scalloped/curvy divider flowing into the next band.
 *   - <Wave>     the SVG section divider on its own.
 *   - <Doodles>  scattered, gently-floating line-art shapes (stars, clouds,
 *                suns, leaves, balloons, squiggles).
 *   - <LineArt>  a single larger ambient illustration (sun, hills, cloud, tree).
 *   - <Squiggle> a hand-drawn underline stroke for highlighted heading words.
 */

import type { ReactNode, CSSProperties } from "react";

/* Soft section tints (must mirror --s-* in globals.css so dividers match). */
export const BAND = {
  cream: "var(--s-cream)",
  sky: "var(--s-sky)",
  butter: "var(--s-butter)",
  mint: "var(--s-mint)",
  pink: "var(--s-pink)",
  grape: "var(--s-grape)",
  white: "var(--s-white)",
  ink: "#241b38",
} as const;
export type BandColor = keyof typeof BAND;

/* Section dividers were removed at the client's request — sections now meet
   with flat colour transitions. Kept as a no-op so existing call-sites stay
   valid; flip to render WAVE_PATHS again if dividers are ever wanted back. */
export function Wave(_props: {
  to: BandColor;
  variant?: "scallop" | "wave" | "hill";
  flip?: boolean;
  className?: string;
}) {
  return null;
}

export function Band({
  bg = "cream",
  to,
  wave = "scallop",
  className = "",
  innerClassName = "",
  children,
}: {
  bg?: BandColor;
  to?: BandColor;
  wave?: "scallop" | "wave" | "hill";
  className?: string;
  innerClassName?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={`relative isolate overflow-hidden ${className}`}
      style={{ background: BAND[bg] }}
    >
      <div className={innerClassName}>{children}</div>
      {to && <Wave to={to} variant={wave} />}
    </section>
  );
}

/* ── Vector shapes ───────────────────────────────────────────────────────── */
type ShapeKind =
  | "star" | "circle" | "ring" | "squiggle" | "zigzag"
  | "cloud" | "sun" | "leaf" | "balloon" | "triangle";

const STAR = "M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7z";

function Shape({ kind, color, size }: { kind: ShapeKind; color: string; size: number }) {
  const s = size;
  switch (kind) {
    case "star":
      return <svg width={s} height={s} viewBox="0 0 24 24" fill={color}><path d={STAR} /></svg>;
    case "circle":
      return <svg width={s} height={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill={color} /></svg>;
    case "ring":
      return <svg width={s} height={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="none" stroke={color} strokeWidth="3" /></svg>;
    case "squiggle":
      return (
        <svg width={s} height={s / 2} viewBox="0 0 48 24" fill="none">
          <path d="M2 12 C8 2,14 22,20 12 S32 2,38 12 S46 22,46 12" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      );
    case "zigzag":
      return (
        <svg width={s} height={s / 2} viewBox="0 0 48 24" fill="none">
          <path d="M2 18 L12 6 L22 18 L32 6 L46 18" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "cloud":
      return (
        <svg width={s} height={s * 0.66} viewBox="0 0 64 42" fill="none">
          <path d="M16 38a13 13 0 01-1-26 17 17 0 0132-3 11 11 0 013 29z" stroke={color} strokeWidth="3" strokeLinejoin="round" />
        </svg>
      );
    case "sun":
      return (
        <svg width={s} height={s} viewBox="0 0 48 48" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round">
          <circle cx="24" cy="24" r="9" fill={color} stroke="none" />
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i * Math.PI) / 4;
            const x1 = 24 + Math.cos(a) * 15, y1 = 24 + Math.sin(a) * 15;
            const x2 = 24 + Math.cos(a) * 21, y2 = 24 + Math.sin(a) * 21;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
          })}
        </svg>
      );
    case "leaf":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill={color}>
          <path d="M5 19C5 10 12 4 20 4c0 9-7 15-15 15z" />
        </svg>
      );
    case "balloon":
      return (
        <svg width={s} height={s * 1.3} viewBox="0 0 24 32" fill="none">
          <ellipse cx="12" cy="11" rx="9" ry="11" fill={color} />
          <path d="M12 22v6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "triangle":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <path d="M12 4 L21 20 L3 20 Z" stroke={color} strokeWidth="3" strokeLinejoin="round" />
        </svg>
      );
  }
}

type DoodleSpec = { kind: ShapeKind; className: string; color: string; size: number; delay?: number };

const DEFAULT_DOODLES: DoodleSpec[] = [
  { kind: "sun", className: "left-[5%] top-[12%]", color: "var(--c-sun)", size: 44, delay: 0 },
  { kind: "cloud", className: "right-[8%] top-[14%]", color: "var(--c-sky)", size: 48, delay: 0.6 },
  { kind: "star", className: "left-[14%] bottom-[18%]", color: "var(--c-coral)", size: 26, delay: 1 },
  { kind: "squiggle", className: "right-[16%] bottom-[24%]", color: "var(--c-grape)", size: 52, delay: 1.4 },
  { kind: "balloon", className: "left-[46%] top-[6%]", color: "var(--c-bubblegum)", size: 28, delay: 0.3 },
  { kind: "leaf", className: "right-[40%] bottom-[12%]", color: "var(--c-mint)", size: 26, delay: 0.9 },
];

export function Doodles({
  items = DEFAULT_DOODLES,
  className = "",
  style,
}: {
  items?: DoodleSpec[];
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 -z-0 overflow-hidden ${className}`} style={style}>
      {items.map((d, i) => (
        <span key={i} className={`absolute opacity-80 animate-bob ${d.className}`} style={{ animationDelay: `${d.delay ?? 0}s` }}>
          <Shape kind={d.kind} color={d.color} size={d.size} />
        </span>
      ))}
    </div>
  );
}

/** Hand-drawn underline stroke — wrap a highlighted heading word. */
export function Squiggle({
  children,
  color = "var(--c-sun)",
  className = "",
}: {
  children: ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{children}</span>
      <svg aria-hidden viewBox="0 0 120 16" preserveAspectRatio="none" className="absolute -bottom-1 left-0 z-0 h-[0.36em] w-full">
        <path d="M3 9 C30 3,60 14,90 7 S116 5,117 8" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />
      </svg>
    </span>
  );
}

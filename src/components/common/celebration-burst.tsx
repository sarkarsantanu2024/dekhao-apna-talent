"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Mouse-tracking firecracker for the sign-in brand panel.
 *
 * The shell follows the cursor across the panel and keeps firing radial
 * streaks; clicking launches an extra one-shot burst at that point. Pointer
 * position is read on `window` and mapped into the panel's box, so this layer
 * stays `pointer-events: none` and never swallows clicks or text selection.
 *
 * Particle geometry is derived from each index — never Math.random() — so the
 * first client render matches the server HTML exactly. Motion is CSS-driven
 * (see `.fw-*` in globals.css) and stops under prefers-reduced-motion.
 */

const SPARKS = 44;
const CRACKLES = 18;

/** Firework palette: gold, saffron, violet, pink, cream. */
const COLORS = ["#f5c451", "#ff9f43", "#a855f7", "#ec4899", "#fff4d6", "#c084fc"];

/** Golden angle spreads the sparks evenly instead of into visible spokes. */
const GOLDEN_ANGLE = 137.508;

type Burst = { id: number; x: number; y: number };

const sparks = Array.from({ length: SPARKS }, (_, i) => ({
  key: i,
  ang: `${(i * GOLDEN_ANGLE) % 360}deg`,
  // Three throw lengths interleaved so the shell has visible depth.
  dist: `${210 + (i % 3) * 95 + (i % 7) * 16}px`,
  width: `${26 + (i % 4) * 12}px`,
  color: COLORS[i % COLORS.length],
  delay: `${((i % 6) * 0.3).toFixed(2)}s`,
  dur: `${(1.8 + (i % 3) * 0.45).toFixed(2)}s`,
}));

const crackles = Array.from({ length: CRACKLES }, (_, i) => ({
  key: i,
  ang: `${(i * GOLDEN_ANGLE * 1.7) % 360}deg`,
  dist: `${250 + (i % 4) * 70}px`,
  color: COLORS[(i + 2) % COLORS.length],
  delay: `${((i % 5) * 0.42 + 0.2).toFixed(2)}s`,
  dur: `${(2.3 + (i % 3) * 0.4).toFixed(2)}s`,
}));

/** One firework: flash, radial streaks, crackle pops. */
function Shell({ scale = 1 }: { scale?: number }) {
  return (
    <>
      <span className="fw-flash" style={{ ["--dur" as string]: "1.9s" }} />
      {sparks.map((s) => (
        <span
          key={`s${s.key}`}
          className="fw-spark"
          style={
            {
              "--ang": s.ang,
              "--dist": `calc(${s.dist} * ${scale})`,
              "--delay": s.delay,
              "--dur": s.dur,
              width: s.width,
              background: `linear-gradient(90deg, transparent, ${s.color})`,
              boxShadow: `0 0 10px ${s.color}, 0 0 22px ${s.color}66`,
            } as React.CSSProperties
          }
        />
      ))}
      {crackles.map((c) => (
        <span
          key={`c${c.key}`}
          className="fw-crackle"
          style={
            {
              "--ang": c.ang,
              "--dist": `calc(${c.dist} * ${scale})`,
              "--delay": c.delay,
              "--dur": c.dur,
              background: c.color,
              boxShadow: `0 0 12px ${c.color}`,
            } as React.CSSProperties
          }
        />
      ))}
    </>
  );
}

export function CelebrationBurst({ className = "" }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  // Start centred; the pointer takes over on first move inside the panel.
  const [pos, setPos] = useState({ x: 50, y: 44, tracking: false });
  const [bursts, setBursts] = useState<Burst[]>([]);
  const frame = useRef(0);
  const nextId = useRef(0);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onMove = (e: PointerEvent) => {
      if (frame.current) return; // coalesce to one update per frame
      frame.current = window.requestAnimationFrame(() => {
        frame.current = 0;
        const r = host.getBoundingClientRect();
        if (!r.width || !r.height) return;
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top) / r.height) * 100;
        // Only follow while the pointer is actually over the brand panel.
        if (x < 0 || x > 100 || y < 0 || y > 100) return;
        setPos({ x, y, tracking: true });
      });
    };

    const onClick = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      if (x < 0 || x > 100 || y < 0 || y > 100) return;
      const id = nextId.current++;
      setBursts((b) => [...b, { id, x, y }]);
      window.setTimeout(() => setBursts((b) => b.filter((n) => n.id !== id)), 2200);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onClick, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onClick);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, []);

  return (
    <div ref={hostRef} aria-hidden className={`pointer-events-none ${className}`}>
      {/* Main shell — glides to wherever the cursor is */}
      <div
        className="fw-shell"
        style={{ transform: `translate(${pos.x}%, ${pos.y}%)` }}
      >
        <Shell />
        {[0, 1].map((r) => (
          <span
            key={`ring${r}`}
            className="fw-ring text-amber-200/50"
            style={{ animationDelay: `${r * 1.3}s` }}
          />
        ))}
      </div>

      {/* Click-launched one-shot bursts */}
      {bursts.map((b) => (
        <div key={b.id} className="fw-shell" style={{ transform: `translate(${b.x}%, ${b.y}%)` }}>
          <Shell scale={1.25} />
        </div>
      ))}
    </div>
  );
}

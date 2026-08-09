/**
 * Looping celebration firework for the sign-in brand panel.
 *
 * Every value is derived from the piece's index — never Math.random() — so the
 * server and client render identical markup and React doesn't throw a
 * hydration mismatch. Pure CSS animation (see `.celebrate-*` in globals.css);
 * no JS runs after paint, and it stops entirely under prefers-reduced-motion.
 */

const PIECES = 26;

/** Brand confetti: violet, pink, gold, cream. */
const COLORS = ["#a855f7", "#ec4899", "#f5c451", "#ffffff", "#c084fc", "#fb7185"];

/** Golden-angle spread keeps the pieces from clumping into visible spokes. */
const GOLDEN_ANGLE = 137.508;

export function CelebrationBurst({ className = "" }: { className?: string }) {
  const pieces = Array.from({ length: PIECES }, (_, i) => {
    const angle = (i * GOLDEN_ANGLE * Math.PI) / 180;
    // Vary the throw distance in a repeating 3-step cycle so the burst has depth.
    const distance = 150 + (i % 3) * 58 + (i % 5) * 12;
    const isRibbon = i % 4 === 0;

    return {
      key: i,
      tx: `${(Math.cos(angle) * distance).toFixed(1)}px`,
      ty: `${(Math.sin(angle) * distance).toFixed(1)}px`,
      rot: `${(i % 2 === 0 ? 1 : -1) * (180 + (i % 4) * 90)}deg`,
      color: COLORS[i % COLORS.length],
      // Stagger across the loop so pieces launch continuously, not in lockstep.
      delay: `${((i % 7) * 0.42).toFixed(2)}s`,
      dur: `${(3.1 + (i % 3) * 0.5).toFixed(1)}s`,
      width: isRibbon ? 4 : 7,
      height: isRibbon ? 12 : 7,
      radius: isRibbon ? "2px" : i % 3 === 0 ? "9999px" : "1px",
    };
  });

  return (
    <div aria-hidden className={`pointer-events-none ${className}`}>
      {/* Expanding shockwave rings */}
      {[0, 1, 2].map((r) => (
        <span
          key={`ring-${r}`}
          className="celebrate-ring text-white/45"
          style={{ animationDelay: `${r * 1.13}s` }}
        />
      ))}

      {/* Confetti */}
      {pieces.map((p) => (
        <span
          key={p.key}
          className="celebrate-piece"
          style={
            {
              "--tx": p.tx,
              "--ty": p.ty,
              "--rot": p.rot,
              "--dur": p.dur,
              animationDelay: p.delay,
              width: `${p.width}px`,
              height: `${p.height}px`,
              borderRadius: p.radius,
              background: p.color,
              boxShadow: `0 0 12px ${p.color}`,
            } as React.CSSProperties
          }
        />
      ))}

      {/* Warm core glow the burst launches from */}
      <span className="absolute left-1/2 top-1/2 size-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(245,196,81,0.28),transparent_70%)] blur-xl" />
    </div>
  );
}

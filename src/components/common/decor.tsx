/**
 * Ambient neon decoration — floating gradient blobs, a slow-rotating spiral
 * ring, and a pulsing dot-grid. Pure CSS animation (no JS), pointer-events
 * disabled. Drop inside any `relative overflow-hidden` section.
 */
export function Decor({
  blobs = true,
  spiral = true,
  dots = true,
  className = "",
}: {
  blobs?: boolean;
  spiral?: boolean;
  dots?: boolean;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 -z-0 overflow-hidden ${className}`}
    >
      {blobs && (
        <>
          <div className="absolute -left-32 -top-24 size-80 rounded-full bg-[#8b5cf6]/20 blur-[110px] animate-float" />
          <div
            className="absolute -bottom-32 -right-24 size-96 rounded-full bg-[#ec4899]/15 blur-[120px] animate-float"
            style={{ animationDelay: "1.8s" }}
          />
        </>
      )}

      {spiral && (
        <div className="absolute -right-24 top-1/4 size-[26rem] rounded-full opacity-20 animate-spin-slow [background:conic-gradient(from_0deg,transparent,rgba(168,85,247,0.65),transparent_45%,rgba(236,72,153,0.65),transparent_75%)] [mask:radial-gradient(circle,transparent_60%,#000_62%)]" />
      )}

      {dots && (
        <div className="absolute left-8 top-24 grid grid-cols-3 gap-2.5">
          {Array.from({ length: 9 }).map((_, i) => (
            <span
              key={i}
              className="size-1 rounded-full bg-white/50 animate-pulse-glow"
              style={{ animationDelay: `${i * 0.22}s` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

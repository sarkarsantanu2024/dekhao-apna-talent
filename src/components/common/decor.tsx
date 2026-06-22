/**
 * Playful ambient decoration for the kids' theme — soft floating colour blobs,
 * a slow-spinning sunburst ring, and a cluster of twinkling stars. Pure CSS
 * animation (no JS), pointer-events disabled. Drop inside any
 * `relative overflow-hidden` section.
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
          <div className="absolute -left-28 -top-20 size-80 rounded-full bg-crayon-grape/25 blur-[100px] animate-float" />
          <div
            className="absolute -bottom-28 -right-20 size-96 rounded-full bg-crayon-coral/20 blur-[110px] animate-float"
            style={{ animationDelay: "1.6s" }}
          />
          <div
            className="absolute right-1/3 top-10 size-64 rounded-full bg-crayon-sky/20 blur-[90px] animate-float"
            style={{ animationDelay: "0.8s" }}
          />
        </>
      )}

      {spiral && (
        <div className="absolute -right-24 top-1/4 size-[24rem] rounded-full opacity-30 animate-spin-slow [background:conic-gradient(from_0deg,transparent,rgba(255,200,61,0.7),transparent_35%,rgba(46,196,182,0.6),transparent_60%,rgba(155,93,229,0.6),transparent_85%)] [mask:radial-gradient(circle,transparent_58%,#000_60%)]" />
      )}

      {dots && (
        <div className="absolute left-8 top-24 grid grid-cols-3 gap-3">
          {["#ff6b6b", "#ffc83d", "#2ec4b6", "#4da8ff", "#9b5de5", "#ff8fd0", "#ffc83d", "#2ec4b6", "#ff6b6b"].map(
            (c, i) => (
              <span
                key={i}
                className="material-symbols-rounded animate-twinkle"
                style={{
                  color: c,
                  fontSize: 14,
                  animationDelay: `${i * 0.22}s`,
                  fontVariationSettings: "'FILL' 1",
                }}
              >
                star
              </span>
            ),
          )}
        </div>
      )}
    </div>
  );
}

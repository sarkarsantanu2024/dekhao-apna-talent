type Props = {
  items: readonly string[];
  className?: string;
};

/** Bright candy ticker. Duplicates content so CSS translateX -50% loops seamlessly. */
export function Marquee({ items, className }: Props) {
  const dots = ["#ff6b6b", "#ffc83d", "#2ec4b6", "#4da8ff", "#9b5de5"];
  return (
    <div
      className={`relative overflow-hidden border-y-4 border-foreground/10 bg-brand-gradient ${className ?? ""}`}
    >
      <div className="marquee-track flex w-max items-center gap-10 whitespace-nowrap py-4">
        {[...items, ...items].map((it, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-10 text-[clamp(1.1rem,2.2vw,1.8rem)] font-extrabold uppercase tracking-tight text-white"
          >
            {it}
            <span
              aria-hidden
              className="material-symbols-rounded"
              style={{ color: dots[i % dots.length], fontSize: 22, fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

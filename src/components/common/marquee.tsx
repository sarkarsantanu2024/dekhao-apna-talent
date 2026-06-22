import { Star } from "lucide-react";

type Props = {
  items: readonly string[];
  className?: string;
};

/** Editorial running banner — ink band, serif words, gold star separators.
 *  Content is duplicated so the CSS translateX(-50%) loop is seamless. */
export function Marquee({ items, className }: Props) {
  return (
    <div
      className={`on-ink relative overflow-hidden border-y border-ink/10 bg-ink py-5 ${className ?? ""}`}
      style={{ ["--ink" as string]: "#1b1510" }}
    >
      <div className="marquee-track flex w-max items-center whitespace-nowrap">
        {[...items, ...items].map((it, i) => (
          <span key={i} className="inline-flex items-center text-[#f3ead9]">
            <span className="font-display text-[clamp(1.05rem,2.2vw,1.7rem)] font-medium tracking-tight">
              {it}
            </span>
            <Star className="mx-7 size-3.5 shrink-0 text-gold-soft" strokeWidth={0} fill="currentColor" />
          </span>
        ))}
      </div>
    </div>
  );
}

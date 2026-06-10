type Props = {
  items: readonly string[];
  className?: string;
};

/** Infinite horizontal ticker. Duplicates content so CSS translateX -50% loops seamlessly. */
export function Marquee({ items, className }: Props) {
  return (
    <div className={`relative overflow-hidden border-y border-white/10 bg-black ${className ?? ""}`}>
      <div className="marquee-track flex w-max items-center gap-12 whitespace-nowrap py-5">
        {[...items, ...items].map((it, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-12 text-[clamp(1.25rem,2.4vw,2rem)] font-black uppercase tracking-tight text-white/85"
          >
            {it}
            <span aria-hidden className="inline-block size-2 rounded-full bg-[#A855F7]" />
          </span>
        ))}
      </div>
    </div>
  );
}

import { SOCIALS } from "./social-icons";

/** Floating vertical social bar pinned to the right edge on every page. */
export function SocialRail() {
  return (
    <div className="fixed right-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-3 lg:flex">
      {SOCIALS.map((s) => (
        <a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.label}
          className="group inline-flex size-10 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/70 backdrop-blur transition-all hover:border-transparent hover:bg-brand-gradient hover:text-white"
        >
          <s.Icon className="size-4 transition-transform group-hover:scale-110" />
        </a>
      ))}
      <span className="mt-1 h-12 w-px bg-gradient-to-b from-white/30 to-transparent" />
    </div>
  );
}

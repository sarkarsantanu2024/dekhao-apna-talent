import { Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { LOGIN_NOTICES } from "@/constants";

/**
 * News-style horizontal ticker for the centre portal — the trilingual
 * important notice (EN / BN / HI) scrolls endlessly like a news channel bar.
 * Reuses the site's .marquee-track loop (content duplicated once so the
 * translateX(-50%) animation is seamless; reduced-motion turns it off).
 */
export function NoticeMarquee({ className }: { className?: string }) {
  const items = LOGIN_NOTICES.map((n) => n.text);
  return (
    <div
      role="status"
      aria-label="Important notice"
      className={cn(
        "flex items-stretch overflow-hidden rounded-lg border border-amber-300/70 bg-amber-50",
        className,
      )}
    >
      <div className="flex shrink-0 items-center gap-1.5 bg-amber-400 px-3 text-[11px] font-bold uppercase tracking-wider text-amber-950">
        <Megaphone className="size-3.5" /> Notice
      </div>
      <div className="relative flex-1 overflow-hidden py-2">
        {/* The trilingual track is very wide — slow the shared loop right down
            so it reads like a calm news ticker (site default is 42s). */}
        <div
          className="marquee-track flex w-max items-center whitespace-nowrap"
          style={{ animationDuration: "120s" }}
        >
          {[...items, ...items].map((text, i) => (
            <span key={i} className="inline-flex items-center text-sm text-amber-900">
              {text}
              <span className="mx-6 text-amber-500">✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

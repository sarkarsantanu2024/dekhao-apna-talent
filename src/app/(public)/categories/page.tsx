import Image from "next/image";
import Link from "next/link";
import { Music, MicVocal, Calculator, Sparkles, ArrowRight, Ticket } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CATEGORIES } from "@/constants";
import { CATEGORY_IMAGES } from "@/constants/media";
import { PageHero } from "@/components/common/page-hero";
import { ScrollReveal } from "@/components/common/scroll-reveal";
import { Button } from "@/components/ui/button";
import { Band } from "@/components/common/playful";

const META: Record<string, { Icon: LucideIcon; accent: string }> = {
  dance: { Icon: Music, accent: "var(--clay)" },
  song: { Icon: MicVocal, accent: "var(--c-bubblegum)" },
  "mental-math": { Icon: Calculator, accent: "var(--c-sky)" },
  "other-talent": { Icon: Sparkles, accent: "var(--c-mint)" },
};

export const metadata = { title: "Categories" };

export default function CategoriesPage() {
  return (
    <>
      <PageHero
        eyebrow="Categories"
        title={<>Pick your <span className="text-gradient">stage.</span></>}
        subtitle="Choose one — or enter more than one. Each category has its own audition track, all the way to the national finale."
      />
      <Band bg="cream" innerClassName="relative py-24 sm:py-28">
        <div className="container relative mx-auto max-w-6xl px-6">
          <ScrollReveal stagger className="grid gap-6 sm:grid-cols-2">
            {CATEGORIES.map((c, i) => {
              const m = META[c.slug] ?? META.dance;
              const bg = CATEGORY_IMAGES[c.slug];
              return (
                <div
                  key={c.slug}
                  data-reveal-item
                  className="group lift flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-card shadow-pop-sm"
                >
                  {/* image header */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden">
                    {bg && (
                      <Image
                        src={bg}
                        alt={c.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                        className="object-cover transition-transform duration-[1.1s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/55 to-transparent" />
                    <span className="absolute left-5 top-5 font-display text-sm italic text-white/85">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className="absolute bottom-5 left-5 inline-flex size-12 items-center justify-center rounded-full bg-card shadow-pop-sm"
                      style={{ color: m.accent }}
                    >
                      <m.Icon className="size-5" strokeWidth={1.75} />
                    </span>
                    <span className="absolute right-5 top-5 rounded-full bg-background/85 px-3 py-1 font-mono text-[11px] text-foreground backdrop-blur">
                      MM-{c.prefix}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-7">
                    <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{c.name}</h2>
                    <p className="mt-2 leading-relaxed text-muted-foreground">{c.blurb}</p>
                    <div className="mt-7 flex items-center justify-between border-t border-border pt-5">
                      <div>
                        <span className="eyebrow block text-muted-foreground">Registration</span>
                        <span className="mt-1 inline-flex items-center gap-1.5 font-display text-2xl font-semibold">
                          <Ticket className="size-4 text-gold-deep" strokeWidth={1.75} />
                          ₹{c.fee}
                        </span>
                      </div>
                      <Button asChild variant="outline" size="sm" className="group/btn">
                        <Link href="/login" className="inline-flex items-center gap-1.5">
                          Register
                          <ArrowRight className="size-3.5 transition-transform group-hover/btn:translate-x-0.5" strokeWidth={1.75} />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </ScrollReveal>
        </div>
      </Band>
    </>
  );
}

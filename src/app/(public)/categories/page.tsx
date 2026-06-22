import Link from "next/link";
import { CATEGORIES } from "@/constants";
import { PageHero } from "@/components/common/page-hero";
import { ScrollReveal } from "@/components/common/scroll-reveal";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/common/icon";
import { Band, Doodles } from "@/components/common/playful";

const META: Record<string, { icon: string; tint: string; chip: string }> = {
  dance: {
    icon: "music_note",
    tint: "bg-crayon-coral/12",
    chip: "bg-crayon-coral",
  },
  song: { icon: "mic", tint: "bg-crayon-grape/12", chip: "bg-crayon-grape" },
  "mental-math": {
    icon: "calculate",
    tint: "bg-crayon-sky/12",
    chip: "bg-crayon-sky",
  },
  "other-talent": {
    icon: "auto_awesome",
    tint: "bg-crayon-mint/12",
    chip: "bg-crayon-mint",
  },
};

export const metadata = { title: "Categories" };

export default function CategoriesPage() {
  return (
    <>
      <PageHero
        eyebrow="Categories"
        title={
          <>
            Pick your <span className="text-gradient">stage!</span>
          </>
        }
        subtitle="Choose one — or join more than one! Each category has its own fun audition track."
        nextBg="cream"
      />
      <Band bg="cream" innerClassName="relative py-20 sm:py-24">
        <Doodles />
        <div className="container relative mx-auto max-w-5xl px-6">
          <ScrollReveal stagger className="grid gap-6 sm:grid-cols-2">
            {CATEGORIES.map((c) => {
              const m = META[c.slug] ?? META.dance;
              return (
                <div
                  key={c.slug}
                  data-reveal-item
                  className="lift flex flex-col rounded-3xl border-2 border-border bg-card p-7 shadow-pop"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex size-14 items-center justify-center rounded-2xl ${m.chip} text-white shadow-pop-sm`}
                    >
                      <span
                        className="material-symbols-rounded"
                        style={{
                          fontSize: 30,
                          fontVariationSettings: "'FILL' 0",
                        }}
                      >
                        {m.icon}
                      </span>
                    </span>
                    <span className="rounded-full bg-muted px-3 py-1 font-mono text-xs text-muted-foreground">
                      MM-{c.prefix}
                    </span>
                  </div>
                  <h2 className="mt-5 text-2xl font-extrabold tracking-tight sm:text-3xl">
                    {c.name}
                  </h2>
                  <p className="mt-2 text-muted-foreground">{c.blurb}</p>
                  <div
                    className={`mt-auto flex items-center justify-between rounded-2xl ${m.tint} px-5 py-4`}
                  >
                    <span className="font-fun text-sm font-semibold text-muted-foreground">
                      Registration fee
                    </span>
                    <span className="text-2xl font-extrabold text-foreground">
                      ₹{c.fee}
                    </span>
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

import Link from "next/link";
import { CATEGORIES } from "@/constants";
import { CATEGORY_IMAGES } from "@/constants/media";
import { PageHero } from "@/components/common/page-hero";
import { ScrollReveal } from "@/components/common/scroll-reveal";
import { Icon } from "@/components/common/icon";
import { Decor } from "@/components/common/decor";

const ICONS: Record<string, string> = {
  dance: "music_note",
  song: "mic",
  "mental-math": "calculate",
  "other-talent": "star",
};

export const metadata = { title: "Categories" };

function feeLabel(slug: string, fee: number): string {
  return slug === "mental-math" ? "Centre FREE · District ₹250" : `₹${fee}`;
}

export default function CategoriesPage() {
  return (
    <>
      <PageHero
        eyebrow="Categories"
        title={<>Pick your <span className="text-gradient">stage.</span></>}
        subtitle="Choose one — or enter multiple. Each category has its own audition track."
      />

      <section className="relative overflow-hidden border-t border-white/10 py-16 sm:py-24">
        <Decor dots={false} />
        <div className="container relative mx-auto max-w-6xl px-6">
          <ScrollReveal stagger className="grid gap-6 sm:grid-cols-2">
            {CATEGORIES.map((c) => {
              const iconName = ICONS[c.slug] ?? "star";
              return (
                <article
                  key={c.slug}
                  data-reveal-item
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#0c0716] transition-all duration-500 hover:border-[#A855F7]/40 hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.4)]"
                >
                  {/* Photo */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={CATEGORY_IMAGES[c.slug]}
                      alt={c.name}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0716] via-[#0c0716]/35 to-transparent" />
                    {/* Icon badge */}
                    <span className="absolute left-5 top-5 inline-flex size-12 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-lg shadow-black/40">
                      <Icon name={iconName} size={24} aria-label={c.name} />
                    </span>
                    {/* Fee pill */}
                    <span className="absolute right-5 top-5 rounded-full border border-white/20 bg-black/50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur">
                      {feeLabel(c.slug, c.fee)}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-7 sm:p-8">
                    <h2 className="text-2xl font-black uppercase tracking-tight sm:text-3xl">{c.name}</h2>
                    <p className="mt-3 text-lg text-white/70">{c.blurb}</p>

                    <div className="mt-7 flex items-center justify-between border-t border-white/10 pt-5">
                      <span className="inline-flex items-center gap-2 text-sm text-white/55">
                        <Icon name="event" size={18} className="text-gradient" />
                        District-wise auditions
                      </span>
                      <Link
                        href="/rules"
                        className="inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:text-[#EC4899]"
                      >
                        Guidelines
                        <Icon name="arrow_outward" size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </ScrollReveal>

          {/* CTA strip */}
          <ScrollReveal>
            <div className="mt-10 flex flex-col items-center gap-5 rounded-3xl border border-[#A855F7]/30 bg-[#A855F7]/[0.06] p-8 text-center sm:flex-row sm:justify-between sm:text-left">
              <div>
                <span className="font-script text-3xl text-gradient sm:text-4xl">Ready to shine?</span>
                <p className="mt-1 text-lg text-white/70">Ask your Mind Mantra Abacus centre to register your child.</p>
              </div>
              <Link
                href="/contact"
                className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-brand-gradient px-7 font-bold uppercase tracking-wider text-white transition-shadow hover:shadow-[0_0_34px_-6px_rgba(168,85,247,0.7)]"
              >
                Contact us
                <Icon name="arrow_outward" size={18} />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}

import { CATEGORIES } from "@/constants";
import { PageHero } from "@/components/common/page-hero";
import { ScrollReveal } from "@/components/common/scroll-reveal";
import { Icon } from "@/components/common/icon";

const ICONS: Record<string, string> = {
  dance: "auto_awesome",
  song: "music_note",
  "mental-math": "calculate",
  "other-talent": "star",
};

export const metadata = { title: "Categories" };

export default function CategoriesPage() {
  return (
    <>
      <PageHero
        eyebrow="Categories"
        title={<>Pick your <span className="text-[#FF5A1F]">stage.</span></>}
        subtitle="Choose one — or enter multiple. Each category has its own audition track."
      />
      <section className="border-t border-white/10 py-20">
        <div className="container mx-auto px-6">
          <ScrollReveal stagger className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-2">
            {CATEGORIES.map((c, i) => {
              const iconName = ICONS[c.slug];
              return (
                <div
                  key={c.slug}
                  data-reveal-item
                  className="group relative bg-black p-8 transition-colors hover:bg-[#0F0F14] sm:p-10"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-white/40">0{i + 1}</span>
                    <Icon name="arrow_outward" size={18} className="text-white/30 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#FF5A1F]" />
                  </div>
                  <Icon name={iconName} size={36} className="mt-8 text-[#FF5A1F]" />
                  <h2 className="mt-6 text-2xl font-black uppercase tracking-tight sm:text-3xl">{c.name}</h2>
                  <p className="mt-3 text-white/65">{c.blurb}</p>
                  <div className="mt-10 grid grid-cols-2 gap-6 border-t border-white/10 pt-6 text-sm">
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-white/40">Registration fee</div>
                      <div className="mt-1 text-lg font-bold text-white">₹{c.fee}</div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-white/40">Roll prefix</div>
                      <div className="mt-1 font-mono text-white/80">MM-{c.prefix}-YEAR-0001</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}

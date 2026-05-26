import { PRIZES } from "@/constants";
import { Icon } from "@/components/common/icon";
import { PageHero } from "@/components/common/page-hero";
import { ScrollReveal } from "@/components/common/scroll-reveal";

export const metadata = { title: "Prize Details" };

export default function PrizesPage() {
  return (
    <>
      <PageHero
        eyebrow="Prizes"
        title={<>Cash prizes <span className="text-[#FF5A1F]">& awards.</span></>}
        subtitle="Cash prizes for finalists, plus awards and certificates for everyone who steps on stage."
      />
      <section className="border-t border-white/10 py-20">
        <div className="container mx-auto max-w-5xl px-6">
          <ScrollReveal stagger className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-2">
            <div data-reveal-item className="bg-black p-10">
              <PrizeCard title="Dance & Song" num="01" rows={PRIZES.danceSong} />
            </div>
            <div data-reveal-item className="bg-black p-10">
              <PrizeCard title="Abacus (per level)" num="02" rows={PRIZES.abacus} />
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="mt-10 rounded-xl border border-[#FF5A1F]/40 bg-[#FF5A1F]/5 p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#FF5A1F]">India-Level Records</p>
              <p className="mt-3 text-white/85">
                Top 5 abacus students get the chance to attempt India-Level Records by Mind Mantra Abacus.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}

function PrizeCard({
  title,
  num,
  rows,
}: {
  title: string;
  num: string;
  rows: readonly { rank: string; amount: number }[];
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-white/40">{num}</span>
        <Icon name="emoji_events" size={22} className="text-[#FF5A1F]" filled />
      </div>
      <h2 className="mt-8 text-2xl font-black uppercase tracking-tight">{title}</h2>
      <ul className="mt-6 divide-y divide-white/10">
        {rows.map((r) => (
          <li key={r.rank} className="flex items-baseline justify-between py-3 text-sm">
            <span className="text-white/70">{r.rank}</span>
            <span className="font-mono text-lg font-bold text-white">
              ₹{r.amount.toLocaleString("en-IN")}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-xs uppercase tracking-wider text-white/40">+ award and certificate</p>
    </div>
  );
}

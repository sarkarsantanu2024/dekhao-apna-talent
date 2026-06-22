import { PRIZES } from "@/constants";
import { Icon } from "@/components/common/icon";
import { PageHero } from "@/components/common/page-hero";
import { ScrollReveal } from "@/components/common/scroll-reveal";
import { Band, Doodles } from "@/components/common/playful";

export const metadata = { title: "Prize Details" };

const RANK_COLOR = ["bg-crayon-sun", "bg-crayon-sky", "bg-crayon-coral", "bg-crayon-mint"];

export default function PrizesPage() {
  return (
    <>
      <PageHero
        eyebrow="Prizes"
        title={<>Cash prizes <span className="text-gradient">& awards!</span></>}
        subtitle="Cash prizes for finalists — plus a medal, award and certificate for everyone who steps on stage."
        nextBg="cream"
      />
      <Band bg="cream" to="grape" innerClassName="relative py-20 sm:py-24">
        <Doodles />
        <div className="container relative mx-auto max-w-5xl px-6">
          <ScrollReveal stagger className="grid gap-6 md:grid-cols-2">
            <div data-reveal-item>
              <PrizeCard title="Dance & Song" icon="emoji_events" accent="bg-crayon-coral" rows={PRIZES.danceSong} />
            </div>
            <div data-reveal-item>
              <PrizeCard title="Abacus (per level)" icon="calculate" accent="bg-crayon-sky" rows={PRIZES.abacus} />
            </div>
          </ScrollReveal>
        </div>
      </Band>

      <Band bg="grape" innerClassName="relative py-16 sm:py-20">
        <div className="container relative mx-auto max-w-3xl px-6">
          <div className="rounded-3xl bg-brand-gradient p-8 text-center text-white shadow-pop sm:p-10">
            <Icon name="workspace_premium" size={48} filled />
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">India-Level Records</h2>
            <p className="mt-3 text-white/90">
              The top 5 abacus students get the chance to attempt India-Level Records by Mind Mantra Abacus!
            </p>
          </div>
        </div>
      </Band>
    </>
  );
}

function PrizeCard({
  title,
  icon,
  accent,
  rows,
}: {
  title: string;
  icon: string;
  accent: string;
  rows: readonly { rank: string; amount: number }[];
}) {
  return (
    <div className="h-full rounded-3xl border-2 border-border bg-card p-7 shadow-pop">
      <span className={`inline-flex size-14 items-center justify-center rounded-2xl ${accent} text-white shadow-pop-sm`}>
        <span className="material-symbols-rounded" style={{ fontSize: 30, fontVariationSettings: "'FILL' 0" }}>{icon}</span>
      </span>
      <h2 className="mt-5 text-2xl font-extrabold tracking-tight">{title}</h2>
      <ul className="mt-6 space-y-3">
        {rows.map((r, i) => (
          <li key={r.rank} className="flex items-center justify-between rounded-2xl bg-muted px-4 py-3">
            <span className="inline-flex items-center gap-2 font-bold text-foreground">
              <span className={`inline-flex size-7 items-center justify-center rounded-full ${RANK_COLOR[i % RANK_COLOR.length]} text-xs font-extrabold text-white`}>
                {i + 1}
              </span>
              {r.rank}
            </span>
            <span className="font-display text-xl font-extrabold text-foreground">₹{r.amount.toLocaleString("en-IN")}</span>
          </li>
        ))}
      </ul>
      <p className="mt-5 font-fun text-sm font-semibold text-muted-foreground">+ award and certificate for all</p>
    </div>
  );
}

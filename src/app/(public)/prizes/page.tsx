import { Trophy, Calculator, Award } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PRIZES } from "@/constants";
import { PageHero } from "@/components/common/page-hero";
import { ScrollReveal } from "@/components/common/scroll-reveal";
import { Band } from "@/components/common/playful";

export const metadata = { title: "Prize Details" };

/** Rank accent: gold · silver · bronze/clay · sage */
const RANK_COLOR = ["#c79233", "#9aa0a6", "#b07a4e", "#4f8a76"];

export default function PrizesPage() {
  return (
    <>
      <PageHero
        eyebrow="Prizes"
        title={<>Cash prizes <span className="text-gradient">& honours.</span></>}
        subtitle="Cash prizes for finalists — plus a medal, award and certificate for everyone who steps on stage."
      />
      <Band bg="cream" innerClassName="relative py-24 sm:py-28">
        <div className="container relative mx-auto max-w-7xl px-6">
          <ScrollReveal stagger className="grid gap-6 md:grid-cols-2">
            <div data-reveal-item>
              <PrizeCard title="Dance & Song" Icon={Trophy} rows={PRIZES.danceSong} />
            </div>
            <div data-reveal-item>
              <PrizeCard title="Abacus (per level)" Icon={Calculator} rows={PRIZES.abacus} />
            </div>
          </ScrollReveal>
        </div>
      </Band>

      <Band bg="white" innerClassName="relative py-20 sm:py-24">
        <div className="container relative mx-auto max-w-3xl px-6">
          <div
            className="on-ink relative overflow-hidden rounded-2xl bg-ink p-10 text-center text-[#f3ead9] shadow-pop sm:p-12"
            style={{ ["--ink" as string]: "#1b1510" }}
          >
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(199,146,51,0.22),transparent_55%)]" />
            <div className="relative">
              <Award className="mx-auto size-12 text-gold-soft" strokeWidth={1.5} />
              <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight sm:text-3xl">India-Level Records</h2>
              <p className="mx-auto mt-3 max-w-md leading-relaxed text-[#f3ead9]/75">
                The top 5 abacus students earn the chance to attempt India-Level Records by Mind Mantra Abacus.
              </p>
            </div>
          </div>
        </div>
      </Band>
    </>
  );
}

function PrizeCard({
  title,
  Icon,
  rows,
}: {
  title: string;
  Icon: LucideIcon;
  rows: readonly { rank: string; amount: number }[];
}) {
  return (
    <div className="h-full rounded-2xl border border-ink/10 bg-card p-8 shadow-pop-sm">
      <div className="flex items-center gap-3">
        <span className="inline-flex size-12 items-center justify-center rounded-full bg-secondary text-gold-deep">
          <Icon className="size-6" strokeWidth={1.5} />
        </span>
        <h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
      </div>
      <ul className="mt-7 divide-y divide-border">
        {rows.map((r, i) => (
          <li key={r.rank} className="flex items-center justify-between py-3.5">
            <span className="inline-flex items-center gap-3 font-medium text-foreground">
              <span
                className="inline-flex size-7 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ background: RANK_COLOR[i % RANK_COLOR.length] }}
              >
                {i + 1}
              </span>
              {r.rank}
            </span>
            <span className="font-display text-xl font-semibold text-foreground">₹{r.amount.toLocaleString("en-IN")}</span>
          </li>
        ))}
      </ul>
      <p className="mt-6 border-t border-border pt-5 text-sm text-muted-foreground">
        + award and certificate for all participants
      </p>
    </div>
  );
}

import { Music, MicVocal, Calculator, Sparkles, Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageHero } from "@/components/common/page-hero";
import { ScrollReveal } from "@/components/common/scroll-reveal";
import { Band } from "@/components/common/playful";

export const metadata = { title: "Competition Guidelines" };

const RULES: { title: string; fee: string; Icon: LucideIcon; accent: string; items: string[] }[] = [
  {
    title: "Dance Category",
    fee: "₹400",
    Icon: Music,
    accent: "var(--clay)",
    items: [
      "Every participant must fill up the registration form.",
      "District-wise auditions on specific dates.",
      "Any dance form is allowed.",
      "Top performers selected for the Final Round in Kolkata.",
      "Judges' decision is final.",
      "Every participant receives a special medal and certificate.",
    ],
  },
  {
    title: "Song Category",
    fee: "₹400",
    Icon: MicVocal,
    accent: "var(--c-bubblegum)",
    items: [
      "Every participant must fill up the registration form.",
      "District-wise auditions on specific dates.",
      "Any type of song is allowed.",
      "Audition performances must be a cappella (without music).",
      "Top performers selected for the Final Round in Kolkata.",
      "Judges' decision is final.",
    ],
  },
  {
    title: "Mental Math Olympiad",
    fee: "Centre FREE · District ₹250 · Finale TBA",
    Icon: Calculator,
    accent: "var(--c-sky)",
    items: [
      "Open to students L1 to L8.",
      "Practice the sample/practice set thoroughly before participating.",
      "Round 1 (Centre): written process, free entry.",
      "Round 2 (District): written exam, questions projected on screen.",
      "Round 3 (Final, Kolkata): written + oral on-stage round.",
    ],
  },
  {
    title: "Other Talent",
    fee: "₹400",
    Icon: Sparkles,
    accent: "var(--c-mint)",
    items: [
      "Send a performance video with your details for shortlisting.",
      "Selected participants then fill the registration form.",
      "District-wise auditions in front of the judges.",
      "Top performers selected for the Final Round in Kolkata.",
    ],
  },
];

export default function RulesPage() {
  return (
    <>
      <PageHero
        eyebrow="Guidelines"
        title={<>The simple <span className="text-gradient">rules.</span></>}
        subtitle="Have a quick read with your grown-ups before registering for each category."
      />
      <Band bg="cream" innerClassName="relative py-24 sm:py-28">
        <div className="container relative mx-auto max-w-5xl px-6">
          <ScrollReveal stagger className="grid gap-6 md:grid-cols-2">
            {RULES.map((r) => (
              <div key={r.title} data-reveal-item className="flex flex-col rounded-2xl border border-ink/10 bg-card p-8 shadow-pop-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span
                    className="inline-flex size-12 items-center justify-center rounded-full bg-secondary"
                    style={{ color: r.accent }}
                  >
                    <r.Icon className="size-6" strokeWidth={1.5} />
                  </span>
                  <span className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground">{r.fee}</span>
                </div>
                <h2 className="mt-6 font-display text-2xl font-semibold tracking-tight">{r.title}</h2>
                <ul className="mt-5 space-y-3.5">
                  {r.items.map((it) => (
                    <li key={it} className="flex gap-3 leading-relaxed text-muted-foreground">
                      <Check className="mt-1 size-4 shrink-0 text-gold-deep" strokeWidth={2.5} />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </ScrollReveal>
        </div>
      </Band>
    </>
  );
}

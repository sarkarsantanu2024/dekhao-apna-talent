import { PageHero } from "@/components/common/page-hero";
import { ScrollReveal } from "@/components/common/scroll-reveal";

export const metadata = { title: "Competition Guidelines" };

const RULES = [
  {
    title: "Dance Category",
    fee: "₹400",
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
        title={<>Competition <span className="text-[#FF5A1F]">rules.</span></>}
        subtitle="Read the rules for each category before you register."
      />
      <section className="border-t border-white/10 py-20">
        <div className="container mx-auto max-w-5xl px-6">
          <ScrollReveal stagger className="space-y-px overflow-hidden rounded-2xl border border-white/10 bg-white/10">
            {RULES.map((r, i) => (
              <div key={r.title} data-reveal-item className="bg-black p-8 sm:p-10">
                <div className="grid gap-4 md:grid-cols-[120px_1fr]">
                  <span className="font-mono text-xs text-white/40">0{i + 1}</span>
                  <div>
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <h2 className="text-2xl font-black uppercase tracking-tight sm:text-3xl">{r.title}</h2>
                      <span className="rounded-full border border-[#FF5A1F]/40 bg-[#FF5A1F]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#FF5A1F]">
                        {r.fee}
                      </span>
                    </div>
                    <ul className="mt-6 space-y-3 text-white/70">
                      {r.items.map((it) => (
                        <li key={it} className="flex gap-3">
                          <span className="mt-2.5 inline-block size-1.5 shrink-0 rounded-full bg-[#FF5A1F]" />
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}

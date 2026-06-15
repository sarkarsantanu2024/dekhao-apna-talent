import { PageHero } from "@/components/common/page-hero";
import { ScrollReveal } from "@/components/common/scroll-reveal";
import { Band, Doodles } from "@/components/common/playful";

export const metadata = { title: "Competition Guidelines" };

const RULES = [
  {
    title: "Dance Category",
    fee: "₹400",
    icon: "music_note",
    color: "bg-crayon-coral",
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
    icon: "mic",
    color: "bg-crayon-grape",
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
    icon: "calculate",
    color: "bg-crayon-sky",
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
    icon: "auto_awesome",
    color: "bg-crayon-mint",
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
        subtitle="Have a quick read with your grown-ups before you register for each category."
        nextBg="cream"
      />
      <Band bg="cream" innerClassName="relative py-20 sm:py-24">
        <Doodles />
        <div className="container relative mx-auto max-w-5xl px-6">
          <ScrollReveal stagger className="grid gap-6 md:grid-cols-2">
            {RULES.map((r) => (
              <div key={r.title} data-reveal-item className="flex flex-col rounded-3xl border-2 border-border bg-card p-7 shadow-pop">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className={`inline-flex size-13 items-center justify-center rounded-2xl ${r.color} text-white shadow-pop-sm`}>
                    <span className="material-symbols-rounded" style={{ fontSize: 28, fontVariationSettings: "'FILL' 0" }}>{r.icon}</span>
                  </span>
                  <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-bold text-foreground">{r.fee}</span>
                </div>
                <h2 className="mt-5 text-2xl font-extrabold tracking-tight">{r.title}</h2>
                <ul className="mt-5 space-y-3">
                  {r.items.map((it) => (
                    <li key={it} className="flex gap-3 text-muted-foreground">
                      <span className="material-symbols-rounded mt-0.5 shrink-0 text-crayon-mint" style={{ fontSize: 20, fontVariationSettings: "'FILL' 0" }}>check_circle</span>
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

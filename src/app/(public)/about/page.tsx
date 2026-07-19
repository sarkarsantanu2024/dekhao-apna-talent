import Image from "next/image";
import { Users, Drama, Award, Medal, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { EVENT_NAME } from "@/constants";
import { JUDGES } from "@/constants/media";
import { PageHero } from "@/components/common/page-hero";
import { ScrollReveal } from "@/components/common/scroll-reveal";
import { MaskReveal } from "@/components/common/mask-reveal";
import { Band } from "@/components/common/playful";

export const metadata = { title: "About the Event" };

const JOURNEY: { Icon: LucideIcon; step: string; title: string; body: string }[] = [
  { Icon: Users, step: "Stage 01", title: "District auditions", body: "The judges' team visits district centres on set dates and watches every performance live and in person." },
  { Icon: Drama, step: "Stage 02", title: "National finale", body: "Selected stars perform on the grand National Stage in Kolkata, judged by celebrated Bengali television and music personalities." },
];

const PERKS: { Icon: LucideIcon; label: string }[] = [
  { Icon: Award, label: "A judge-signed certificate" },
  { Icon: Medal, label: "A special commemorative medal" },
  { Icon: Drama, label: "A place on the national stage" },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title={<>All about <span className="text-gradient">{EVENT_NAME}.</span></>}
        subtitle="The inaugural national-stage talent platform for children aged 6–14, presented by Mind Mantra Abacus."
      />

      {/* Mission — editorial statement */}
      <Band bg="white" innerClassName="relative py-24 sm:py-28">
        <div className="container relative mx-auto max-w-3xl px-6 text-center">
          <div className="mx-auto flex w-fit items-center gap-4">
            <span className="h-px w-10 bg-gold" />
            <span className="eyebrow text-gold-deep">Our Purpose</span>
            <span className="h-px w-10 bg-gold" />
          </div>
          <MaskReveal as="h2" className="mt-6 font-display text-3xl font-semibold leading-[1.1] tracking-[-0.02em] sm:text-5xl">
            A real stage for <span className="italic text-gold-deep">every young talent.</span>
          </MaskReveal>
          <ScrollReveal>
            <p className="mt-7 text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Dekhao Apna Talent is presented with care by Mind Mantra Abacus. It brings dance, song, mental
              math and other talents under one national-stage platform — giving children from district
              centres a genuine chance to perform in front of celebrated judges.
            </p>
          </ScrollReveal>
        </div>
      </Band>

      {/* Two-stage journey */}
      <Band bg="cream" innerClassName="relative py-24 sm:py-28">
        <div className="container relative mx-auto max-w-7xl px-6">
          <div className="flex items-center gap-4">
            <span className="h-px w-12 bg-gold" />
            <span className="eyebrow text-gold-deep">The Path</span>
          </div>
          <MaskReveal as="h2" className="mt-6 max-w-2xl font-display text-3xl font-semibold leading-[1.05] tracking-[-0.02em] sm:text-5xl">
            A two-stage journey to the <span className="italic text-gold-deep">finale.</span>
          </MaskReveal>
          <ScrollReveal stagger className="mt-14 grid gap-6 md:grid-cols-2">
            {JOURNEY.map((j) => (
              <div key={j.title} data-reveal-item className="lift rounded-2xl border border-ink/10 bg-card p-8 shadow-pop-sm">
                <div className="flex items-center justify-between">
                  <span className="inline-flex size-12 items-center justify-center rounded-full bg-secondary text-gold-deep">
                    <j.Icon className="size-6" strokeWidth={1.5} />
                  </span>
                  <span className="eyebrow text-gold-deep/70">{j.step}</span>
                </div>
                <h3 className="mt-6 font-display text-2xl font-semibold tracking-tight">{j.title}</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">{j.body}</p>
              </div>
            ))}
          </ScrollReveal>
        </div>
      </Band>

      {/* Judges */}
      <Band bg="white" innerClassName="relative py-24 sm:py-28">
        <div className="container relative mx-auto max-w-7xl px-6">
          <div className="text-center">
            <div className="mx-auto flex w-fit items-center gap-4">
              <span className="h-px w-10 bg-gold" />
              <span className="eyebrow text-gold-deep">The Panel</span>
              <span className="h-px w-10 bg-gold" />
            </div>
            <MaskReveal as="h2" className="mt-6 font-display text-3xl font-semibold tracking-[-0.02em] sm:text-5xl">
              Our <span className="italic text-gold-deep">special judges.</span>
            </MaskReveal>
            <p className="mt-4 text-muted-foreground">…with more stars from popular television joining the finale.</p>
          </div>
          <div className="mx-auto mt-14 grid max-w-md grid-cols-2 gap-6">
            {JUDGES.map((j) => (
              <figure key={j.name} className="group">
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-ink shadow-pop-sm">
                  <Image
                    src={j.src}
                    alt={j.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 220px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent" />
                </div>
                <figcaption className="mt-4 text-center">
                  <p className="font-display text-lg font-semibold tracking-tight">{j.name}</p>
                  <p className="eyebrow mt-1 text-gold-deep">{j.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </Band>

      {/* Every participant + records */}
      <Band bg="cream" innerClassName="relative py-24 sm:py-28">
        <div className="container relative mx-auto max-w-7xl px-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-ink/10 bg-card p-9 shadow-pop-sm">
              <span className="eyebrow text-gold-deep">For everyone</span>
              <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight">Every participant receives</h3>
              <ul className="mt-7 divide-y divide-border">
                {PERKS.map((p) => (
                  <li key={p.label} className="flex items-center gap-4 py-4 text-lg">
                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-gold-deep">
                      <p.Icon className="size-5" strokeWidth={1.5} />
                    </span>
                    {p.label}
                  </li>
                ))}
              </ul>
            </div>
            <div className="on-ink relative flex flex-col justify-center overflow-hidden rounded-2xl bg-ink p-9 text-[#f3ead9] shadow-pop" style={{ ["--ink" as string]: "#1b1510" }}>
              <div aria-hidden className="pointer-events-none absolute right-0 top-0 z-0 size-44 rounded-full bg-[radial-gradient(circle,rgba(199,146,51,0.22),transparent_70%)]" />
              <div className="relative">
                <Trophy className="size-11 text-gold-soft" strokeWidth={1.5} />
                <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight">India-Level Records</h3>
                <p className="mt-3 leading-relaxed text-[#f3ead9]/75">
                  The top 5 abacus students earn a chance to attempt India-Level Records by Mind Mantra Abacus.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Band>
    </>
  );
}

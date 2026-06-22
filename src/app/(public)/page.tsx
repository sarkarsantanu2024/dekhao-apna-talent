import Image from "next/image";
import Link from "next/link";
import {
  Medal, Award, Drama, Coins, MessageCircleHeart, UsersRound,
  ClipboardList, MicVocal, Star, Trophy, Camera, Plus, Quote,
  ArrowRight, ArrowUpRight, Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LATEST_MOMENTS, JUDGES } from "@/constants/media";
import { VideoHero } from "@/components/common/video-hero";
import { Marquee } from "@/components/common/marquee";
import { ScrollReveal } from "@/components/common/scroll-reveal";
import { MaskReveal } from "@/components/common/mask-reveal";
import { CountUp } from "@/components/common/count-up";
import { Magnetic } from "@/components/common/magnetic";
import { HorizontalCategories } from "@/components/common/horizontal-categories";
import { Band } from "@/components/common/playful";

const TICKER = [
  "Dance", "Sing", "Mind Math", "Magic", "Art", "Storytelling", "Acting", "Be a Star",
];

const PERKS: { Icon: LucideIcon; title: string; body: string }[] = [
  { Icon: Medal,             title: "A shining medal",   body: "Every single participant takes one home. On this stage, no one leaves empty-handed." },
  { Icon: Award,             title: "Signed certificate", body: "A judge-signed certificate to carry proudly to school, family and friends." },
  { Icon: Drama,             title: "The national stage", body: "Finalists perform under lights and music on a grand stage in Kolkata." },
  { Icon: Coins,             title: "Cash prizes",       body: "Win up to ₹5,000, plus standout awards across every single category." },
  { Icon: MessageCircleHeart, title: "Star feedback",    body: "Encouragement and tips from celebrated singers and television stars." },
  { Icon: UsersRound,        title: "A new circle",      body: "Meet talented children from across the Mind Mantra network of 200+ centres." },
];

const PROCESS: { Icon: LucideIcon; title: string; body: string }[] = [
  { Icon: ClipboardList, title: "Enrol at a centre", body: "Join through your nearest Mind Mantra centre and receive your very own chest card." },
  { Icon: MicVocal,      title: "Take the stage",    body: "Perform in the district audition round before a warm, encouraging panel of judges." },
  { Icon: Star,          title: "Reach the finale",  body: "Selected stars are invited to the grand National Finale in Kolkata." },
  { Icon: Trophy,        title: "Win & celebrate",   body: "Take home medals, certificates, cash prizes — and a memory for life." },
];

const VOICES = [
  { name: "Ananya's mother", role: "Parent · Howrah", quote: "Mind Mantra gave my daughter focus and confidence. A real stage to perform on is exactly what these children deserve — we signed up the very first day." },
  { name: "Rohan, age 11", role: "Young performer", quote: "Lights, judges, a cheering crowd — it sounds like a real television show. I can't wait to be one of the first ever to perform!" },
  { name: "Mr. Das", role: "Centre Owner · Durgapur", quote: "After years of abacus classes, a flagship talent event from Mind Mantra is something parents have been waiting for. The response has been wonderful." },
];

const FAQ = [
  { q: "Who can take part?", a: "Any child aged 6 to 14 can join through a participating Mind Mantra centre. Every skill level is welcome — this is for everyone." },
  { q: "What can my child perform?", a: "Dance, Song, the Mental Math Olympiad, or any special talent — magic, art, acting or storytelling." },
  { q: "Is it safe and well supervised?", a: "Yes. Every round runs through trusted centres with supervised, child-friendly judging and clear guidelines." },
  { q: "Does everyone receive something?", a: "Absolutely. Every participant receives a medal and a certificate. Winning is a bonus — taking part is the real prize." },
  { q: "How do we register?", a: "Visit your nearest centre or ask them to register you online. Your centre assigns a chest card and you're ready to shine." },
];

export default function HomePage() {
  return (
    <>
      <VideoHero />
      <Marquee items={TICKER} />

      {/* 01 — The Rewards (editorial card index) */}
      <Band bg="white" innerClassName="relative py-24 sm:py-32">
        <div className="container relative mx-auto px-6">
          <div className="grid gap-10 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <Eyebrow index="No. 01" label="The Rewards" />
              <MaskReveal as="h2" className="mt-6 max-w-2xl font-display text-4xl font-semibold leading-[1.02] tracking-[-0.02em] sm:text-6xl">
                Every star takes home{" "}
                <span className="italic text-gold-deep">something to treasure.</span>
              </MaskReveal>
            </div>
            <ScrollReveal className="md:col-span-5">
              <p className="text-lg leading-relaxed text-muted-foreground">
                It was never only about winning. The inaugural edition is built so every child
                leaves taller — with a medal in hand and a memory that lasts.
              </p>
            </ScrollReveal>
          </div>

          <ScrollReveal stagger className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {PERKS.map((p, i) => (
              <div key={p.title} data-reveal-item className="group relative bg-card p-8 transition-colors hover:bg-secondary/50">
                <span className="absolute right-6 top-6 font-display text-sm italic text-border">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="inline-flex size-12 items-center justify-center rounded-full bg-secondary text-gold-deep transition-colors group-hover:bg-gold group-hover:text-ink">
                  <p.Icon className="size-5" strokeWidth={1.75} />
                </span>
                <h3 className="mt-6 font-display text-xl font-semibold tracking-tight">{p.title}</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">{p.body}</p>
              </div>
            ))}
          </ScrollReveal>
        </div>
      </Band>

      {/* 02 — Categories (pinned horizontal) */}
      <HorizontalCategories />

      {/* 03 — Stats (ink editorial band) */}
      <section className="on-ink relative isolate overflow-hidden bg-ink py-20 text-[#f3ead9] sm:py-24" style={{ ["--ink" as string]: "#1b1510" }}>
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
        <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(199,146,51,0.18),transparent_70%)]" />
        <div className="container relative mx-auto px-6">
          <ScrollReveal stagger className="grid grid-cols-2 gap-y-12 divide-gold/20 text-center md:grid-cols-4 md:divide-x">
            <Stat to={200} suffix="+" label="Centres" />
            <Stat to={5000} prefix="₹" label="Top prize" />
            <Stat to={14} prefix="6–" label="Age group" />
            <Stat to={1} prefix="Season " label="Inaugural" plain />
          </ScrollReveal>
        </div>
      </section>

      {/* 04 — How it works (stepped path) */}
      <Band bg="cream" innerClassName="relative py-24 sm:py-32">
        <div className="container relative mx-auto px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow index="No. 03" label="The Journey" centered />
            <MaskReveal as="h2" className="mt-6 font-display text-4xl font-semibold leading-[1.02] tracking-[-0.02em] sm:text-6xl">
              From your centre to the{" "}
              <span className="italic text-gold-deep">national stage.</span>
            </MaskReveal>
          </div>

          <ScrollReveal stagger className="relative mt-20 grid gap-y-12 md:grid-cols-4 md:gap-x-8">
            {/* connecting hairline */}
            <div aria-hidden className="absolute inset-x-[12%] top-6 hidden h-px bg-gradient-to-r from-gold/0 via-gold/50 to-gold/0 md:block" />
            {PROCESS.map((p, i) => (
              <div key={p.title} data-reveal-item className="relative text-center">
                <div className="relative mx-auto grid size-12 place-items-center rounded-full border border-gold/40 bg-background">
                  <span className="font-display text-base italic text-gold-deep">{i + 1}</span>
                </div>
                <span className="mt-6 inline-flex text-foreground/70">
                  <p.Icon className="size-7" strokeWidth={1.5} />
                </span>
                <h3 className="mt-3 font-display text-xl font-semibold tracking-tight">{p.title}</h3>
                <p className="mx-auto mt-2 max-w-xs leading-relaxed text-muted-foreground">{p.body}</p>
              </div>
            ))}
          </ScrollReveal>
        </div>
      </Band>

      {/* 05 — Star judges */}
      <Band bg="butter" innerClassName="relative py-24 sm:py-32">
        <div className="container relative mx-auto grid gap-12 px-6 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="md:sticky md:top-28">
              <Eyebrow index="No. 04" label="The Panel" />
              <MaskReveal as="h2" className="mt-6 font-display text-4xl font-semibold leading-[1.03] tracking-[-0.02em] sm:text-5xl">
                Judged by faces you{" "}
                <span className="italic text-gold-deep">know &amp; love.</span>
              </MaskReveal>
              <ScrollReveal>
                <p className="mt-6 max-w-md leading-relaxed text-muted-foreground">
                  At the national finale, children perform before celebrated stars of Bengali
                  music and television — and receive their warmth, applause and guidance.
                </p>
              </ScrollReveal>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5 md:col-span-8">
            {JUDGES.map((j) => (
              <figure key={j.name} className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-ink">
                <Image
                  src={j.src}
                  alt={j.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover object-top transition-transform duration-[1.1s] ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-ink via-ink/15 to-transparent" />
                <figcaption className="absolute inset-x-0 bottom-0 z-20 p-6">
                  <p className="eyebrow text-gold-soft">{j.role}</p>
                  <p className="mt-2 font-display text-2xl font-semibold tracking-tight text-[#f8f1e3]">{j.name}</p>
                  <p className="mt-2 max-h-0 translate-y-2 overflow-hidden text-sm leading-relaxed text-[#f3ead9]/80 opacity-0 transition-all duration-500 ease-out group-hover:max-h-28 group-hover:translate-y-0 group-hover:opacity-100">{j.bio}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </Band>

      {/* 06 — The stage that awaits (inaugural: a glimpse, not a past archive) */}
      <Band bg="white" innerClassName="relative py-24 sm:py-32">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow index="No. 05" label="The Stage Awaits" />
              <MaskReveal as="h2" className="mt-6 font-display text-4xl font-semibold leading-[1.02] tracking-[-0.02em] sm:text-6xl">
                Picture your child{" "}
                <span className="italic text-gold-deep">up there.</span>
              </MaskReveal>
            </div>
            <Button asChild variant="outline" size="lg">
              <Link href="/gallery" className="inline-flex items-center gap-2">
                Visit the gallery
                <ArrowRight className="size-4" strokeWidth={1.75} />
              </Link>
            </Button>
          </div>

          {/* asymmetric editorial mosaic */}
          <ScrollReveal stagger className="mt-14 grid auto-rows-[200px] grid-cols-2 gap-4 lg:grid-cols-4">
            {LATEST_MOMENTS.slice(0, 6).map((p, i) => (
              <Link
                key={p.id}
                data-reveal-item
                href="/gallery"
                className={`group relative block overflow-hidden rounded-2xl bg-ink ${
                  i === 0 ? "col-span-2 row-span-2" : i === 3 ? "lg:col-span-2" : ""
                }`}
              >
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  sizes="(max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-[1.1s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-background/85 px-3 py-1 text-[11px] font-semibold text-foreground backdrop-blur">
                  <Camera className="size-3" strokeWidth={2} />
                  {p.tag}
                </span>
                <span className="absolute inset-x-0 bottom-0 translate-y-3 p-4 text-sm font-medium text-[#f8f1e3] opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">{p.alt}</span>
              </Link>
            ))}
          </ScrollReveal>
        </div>
      </Band>

      {/* 07 — Why families trust Mind Mantra (ink, big pull-quotes) */}
      <section className="on-ink relative isolate overflow-hidden bg-ink py-24 text-[#f3ead9] sm:py-32" style={{ ["--ink" as string]: "#1b1510" }}>
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
        <div className="container relative mx-auto px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow index="No. 06" label="In Their Words" centered light />
            <MaskReveal as="h2" className="mt-6 font-display text-4xl font-semibold leading-[1.03] tracking-[-0.02em] text-[#f8f1e3] sm:text-6xl">
              Confidence that lasts long{" "}
              <span className="italic text-gold-soft">after the stage.</span>
            </MaskReveal>
          </div>

          <ScrollReveal stagger className="mt-16 grid gap-6 md:grid-cols-3">
            {VOICES.map((t) => (
              <figure key={t.name} data-reveal-item className="flex flex-col rounded-2xl border border-[#f3ead9]/12 bg-[#f3ead9]/[0.03] p-8">
                <Quote className="size-7 text-gold-soft" strokeWidth={1.5} />
                <blockquote className="mt-5 flex-1 font-display text-lg italic leading-relaxed text-[#f5ecda]">
                  {t.quote}
                </blockquote>
                <figcaption className="mt-6 border-t border-[#f3ead9]/12 pt-5">
                  <p className="font-semibold text-[#f8f1e3]">{t.name}</p>
                  <p className="eyebrow mt-1 text-gold-soft/80">{t.role}</p>
                </figcaption>
              </figure>
            ))}
          </ScrollReveal>
        </div>
      </section>

      {/* 08 — FAQ (refined accordion) */}
      <Band bg="cream" innerClassName="relative py-24 sm:py-32">
        <div className="container relative mx-auto grid gap-12 px-6 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="md:sticky md:top-28">
              <Eyebrow index="No. 07" label="Good to Know" />
              <MaskReveal as="h2" className="mt-6 font-display text-4xl font-semibold leading-[1.03] tracking-[-0.02em] sm:text-5xl">
                Quick answers for{" "}
                <span className="italic text-gold-deep">grown-ups.</span>
              </MaskReveal>
            </div>
          </div>
          <div className="md:col-span-8">
            <div className="border-t border-border">
              {FAQ.map((f) => (
                <details key={f.q} className="group border-b border-border [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer items-center justify-between gap-6 py-6 font-display text-xl font-semibold tracking-tight transition-colors hover:text-gold-deep">
                    {f.q}
                    <span className="grid size-8 shrink-0 place-items-center rounded-full border border-border text-foreground transition-all group-open:rotate-45 group-open:border-gold group-open:bg-gold group-open:text-ink">
                      <Plus className="size-4" strokeWidth={2} />
                    </span>
                  </summary>
                  <p className="max-w-2xl pb-6 leading-relaxed text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </Band>

      {/* 09 — Final CTA (dramatic inaugural) */}
      <section className="relative isolate overflow-hidden bg-band-butter py-24 sm:py-32">
        <div className="container relative mx-auto px-6">
          <div
            className="on-ink relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-ink px-8 py-16 text-center text-[#f3ead9] shadow-float sm:px-16 sm:py-20"
            style={{ ["--ink" as string]: "#1b1510" }}
          >
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(230,185,78,0.22),transparent_55%)]" />
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 px-4 py-1.5">
                <Sparkles className="size-4 text-gold-soft" strokeWidth={1.75} />
                <span className="eyebrow text-gold-soft">The Inaugural Edition · 2026</span>
              </span>
              <MaskReveal as="h2" byChar stagger={0.02} className="mx-auto mt-7 block text-balance font-display text-4xl font-semibold leading-[1.0] tracking-[-0.02em] text-[#f8f1e3] sm:text-6xl">
                Be part of the very first.
              </MaskReveal>
              <ScrollReveal>
                <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[#f3ead9]/75">
                  Medals, judge feedback, certificates and a national-stage moment — the
                  story of Dekhao Apna Talent begins now. Join through your nearest centre.
                </p>
                <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                  <Magnetic className="inline-block">
                    <Button asChild variant="fun" size="xl">
                      <Link href="/categories" className="inline-flex items-center gap-2">
                        Explore the categories
                        <ArrowRight className="size-4" strokeWidth={2} />
                      </Link>
                    </Button>
                  </Magnetic>
                  <Button asChild size="xl" className="border border-[#f3ead9]/25 bg-transparent text-[#f3ead9] hover:bg-[#f3ead9] hover:text-ink">
                    <Link href="/contact" className="inline-flex items-center gap-2">
                      Find a centre
                      <ArrowUpRight className="size-4" strokeWidth={2} />
                    </Link>
                  </Button>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Eyebrow({ index, label, centered = false, light = false }: { index: string; label: string; centered?: boolean; light?: boolean }) {
  return (
    <div className={`flex items-center gap-4 ${centered ? "justify-center" : ""}`}>
      <span className={`h-px w-10 ${light ? "bg-gold-soft" : "bg-gold"}`} />
      <span className={`eyebrow ${light ? "text-gold-soft" : "text-gold-deep"}`}>
        {index} — {label}
      </span>
    </div>
  );
}

function Stat({ to, prefix, suffix, label, plain = false }: { to: number; prefix?: string; suffix?: string; label: string; plain?: boolean }) {
  return (
    <div data-reveal-item className="px-4">
      <p className="font-display text-5xl font-semibold tracking-tight text-gold-soft sm:text-6xl">
        {plain ? (
          <>
            <span className="text-3xl sm:text-4xl">{prefix}</span>
            {to}
          </>
        ) : (
          <CountUp to={to} prefix={prefix} suffix={suffix} />
        )}
      </p>
      <p className="eyebrow mt-3 text-[#f3ead9]/60">{label}</p>
    </div>
  );
}

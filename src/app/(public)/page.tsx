import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/common/icon";
import { LATEST_MOMENTS, JUDGES, PAST_EVENT_TICKER } from "@/constants/media";
import { VideoHero } from "@/components/common/video-hero";
import { Marquee } from "@/components/common/marquee";
import { ScrollReveal } from "@/components/common/scroll-reveal";
import { MaskReveal } from "@/components/common/mask-reveal";
import { CountUp } from "@/components/common/count-up";
import { Magnetic } from "@/components/common/magnetic";
import { HorizontalCategories } from "@/components/common/horizontal-categories";
import { Decor } from "@/components/common/decor";

const PROCESS = [
  {
    n: "01",
    title: "Centre signs up",
    body: "Centres open registration and assign chest cards to students who want to compete.",
  },
  {
    n: "02",
    title: "District auditions",
    body: "Judges visit district centres on assigned dates. Performances are evaluated live.",
  },
  {
    n: "03",
    title: "National finale",
    body: "Selected students perform on the National Stage in Kolkata before star judges.",
  },
  {
    n: "04",
    title: "Prizes & records",
    body: "Cash prizes, judge-signed certificates, and a shot at India-Level Records.",
  },
];

export default function HomePage() {
  return (
    <>
      <VideoHero />
      <Marquee items={PAST_EVENT_TICKER} />

      {/* 01 — Intro · sticky eyebrow + count-up stats */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <Decor dots={false} />
        <div className="container relative mx-auto grid gap-12 px-6 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="md:sticky md:top-28">
              <StickyLabel label="The event" />
              <p className="mt-6 text-base text-white/60">
                Presented by Mind Mantra Abacus.
              </p>
              <Link
                href="https://www.mindmantraabacus.com/"
                target="_blank"
                className="relative mt-8 bg-white hidden min-h-[300px] bg-brand-gradient transition-shadow  overflow-hidden rounded-2xl border items-center justify-center border-black md:flex"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/MMA-logo.png" alt="Young performer on stage" />
              </Link>
            </div>
          </div>

          <div className="md:col-span-8">
            <MaskReveal
              as="h2"
              className="text-balance text-4xl font-black uppercase leading-[1.05] tracking-tight sm:text-5xl md:text-6xl"
            >
              A national stage for young performers across Eastern India.
            </MaskReveal>
            <ScrollReveal>
              <p className="mt-7 max-w-2xl text-lg text-white/70 sm:text-xl">
                Dekhao Apna Talent brings dance, song, mental math and other
                talents under one banner. Every participant gets a special medal
                and a judge-signed certificate.
              </p>
            </ScrollReveal>
            <ScrollReveal
              stagger
              className="mt-12 grid grid-cols-3 gap-6 border-t border-white/10 pt-8"
            >
              <div data-reveal-item>
                <p className="text-3xl font-black sm:text-5xl">
                  <CountUp to={200} suffix="+" />
                </p>
                <p className="mt-2 text-xs uppercase tracking-wider text-white/60">
                  Centres
                </p>
              </div>
              <div data-reveal-item>
                <p className="text-3xl font-black sm:text-5xl">
                  <CountUp to={14} prefix="6–" />
                </p>
                <p className="mt-2 text-xs uppercase tracking-wider text-white/60">
                  Age group
                </p>
              </div>
              <div data-reveal-item>
                <p className="text-3xl font-black sm:text-5xl">
                  <CountUp to={5000} prefix="₹" />
                </p>
                <p className="mt-2 text-xs uppercase tracking-wider text-white/60">
                  Top prize
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 02 — Horizontal pinned categories */}
      <HorizontalCategories />

      {/* 03 — Process strip */}
      <section className="relative overflow-hidden border-t border-b border-white/10 bg-[#0c0716] py-24 sm:py-32">
        <Decor />
        <div className="container relative mx-auto px-6">
          <div className="grid gap-12 md:grid-cols-12">
            <div className="md:col-span-4">
              <div className="md:sticky md:top-28">
                <StickyLabel label="The journey" />
                <MaskReveal
                  as="h2"
                  className="mt-6 text-3xl font-black uppercase leading-[1.05] tracking-tight sm:text-5xl"
                >
                  From your centre to the national stage.
                </MaskReveal>
              </div>
            </div>

            <ScrollReveal stagger className="md:col-span-8">
              {PROCESS.map((p, i) => (
                <div
                  key={p.n}
                  data-reveal-item
                  className={`grid grid-cols-[28px_1fr] gap-6 py-8 ${i > 0 ? "border-t border-white/10" : ""}`}
                >
                  <span className="mt-3 h-2.5 w-2.5 rounded-full bg-brand-gradient" />
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-white">
                      {p.title}
                    </h3>
                    <p className="mt-2 text-lg text-white/65">{p.body}</p>
                  </div>
                </div>
              ))}
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 04 — Judges with parallax portraits */}
      <section className="relative overflow-hidden border-t border-white/10 py-24 sm:py-32">
        <Decor dots={false} />
        <div className="container relative mx-auto grid gap-12 px-6 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="md:sticky md:top-28">
              <StickyLabel label="Star judges" />
              <MaskReveal
                as="h2"
                className="mt-6 text-3xl font-black uppercase leading-[1.05] tracking-tight sm:text-4xl"
              >
                Judged by faces you know.
              </MaskReveal>
              <ScrollReveal>
                <p className="mt-6 max-w-md text-white/65">
                  Performances at the national finale are judged by celebrated
                  names from Bengali music and television.
                </p>
              </ScrollReveal>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:col-span-8">
            {JUDGES.map((j) => (
              <div
                key={j.name}
                className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10"
              >
                <Image
                  src={j.src}
                  alt={j.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover object-top grayscale transition-all duration-700 ease-out group-hover:scale-105 group-hover:grayscale-0"
                />
                {/* darkening veil that deepens on hover so the text stays readable */}
                <div className="absolute inset-0 z-10 bg-linear-to-t from-black via-black/30 to-transparent transition-opacity duration-500 group-hover:via-black/55" />
                <div className="absolute inset-x-0 bottom-0 z-20 p-5">
                  <p className="text-[11px] uppercase tracking-wider text-gradient">
                    {j.role}
                  </p>
                  <p className="mt-1 text-xl font-black uppercase tracking-tight">
                    {j.name}
                  </p>
                  {/* detail reveals smoothly on hover */}
                  <p className="mt-0 max-h-0 translate-y-2 overflow-hidden text-sm leading-snug text-white/75 opacity-0 transition-all duration-500 ease-out group-hover:mt-2 group-hover:max-h-28 group-hover:translate-y-0 group-hover:opacity-100">
                    {j.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 05 — Gallery preview · hover-grow cards */}
      <section className="relative border-t border-white/10 bg-[#0F0F14] py-24 sm:py-32">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <StickyLabel label="Latest moments" />
              <MaskReveal
                as="h2"
                className="mt-6 text-3xl font-black uppercase leading-[1.05] tracking-tight sm:text-5xl"
              >
                Fresh from this edition.
              </MaskReveal>
            </div>
            <Link
              href="/gallery"
              className="group inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/70 hover:text-white"
            >
              See full gallery
              <Icon
                name="arrow_outward"
                size={18}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </div>

          <ScrollReveal
            stagger
            className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            {LATEST_MOMENTS.map((p) => (
              <Link
                key={p.id}
                data-reveal-item
                href="/gallery"
                className="group relative block aspect-[4/3] overflow-hidden rounded-xl border border-white/10"
              >
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  sizes="(max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
                />
                <span className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/30" />
                <span className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
                  {p.tag}
                </span>
                <span className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black via-black/70 to-transparent p-4 text-sm text-white/90 transition-transform duration-500 group-hover:translate-y-0">
                  {p.alt}
                </span>
              </Link>
            ))}
          </ScrollReveal>
        </div>
      </section>

      {/* 06 — Final CTA · giant headline mask reveal */}
      <section className="relative border-t border-white/10 py-32 sm:py-40">
        <div className="container mx-auto px-6 text-center">
          <StickyLabel label="Join us" centered />
          <MaskReveal
            as="h2"
            byChar
            stagger={0.035}
            className="mx-auto mt-8 block max-w-5xl text-balance text-5xl font-black uppercase leading-[1.0] tracking-tight sm:text-7xl md:text-[8vw]"
          >
            Your stage is waiting.
          </MaskReveal>
          <ScrollReveal>
            <p className="mx-auto mt-8 max-w-xl text-white/65">
              Open your centre&apos;s registration window now. Chest cards,
              judge feedback, certificates and a national-stage chance — all
              included.
            </p>
            <Magnetic className="mt-10 inline-block">
              <Button
                asChild
                size="lg"
                className="h-14 bg-[#A855F7] px-8 font-bold uppercase tracking-wider text-black hover:bg-[#ff6b35]"
              >
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2"
                >
                  Register your centre
                  <Icon name="arrow_outward" size={20} />
                </Link>
              </Button>
            </Magnetic>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}

function StickyLabel({
  label,
  centered = false,
}: {
  label: string;
  centered?: boolean;
}) {
  return (
    <div
      className={`inline-flex items-center gap-3 ${centered ? "mx-auto" : ""}`}
    >
      <span className="h-px w-10 bg-brand-gradient" />
      <span className="font-script text-3xl leading-none text-gradient sm:text-4xl">
        {label}
      </span>
    </div>
  );
}

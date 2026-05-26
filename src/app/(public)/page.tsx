import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/common/icon";
import { LATEST_MOMENTS, JUDGES, PAST_EVENT_TICKER } from "@/constants/media";
import { VideoHero } from "@/components/common/video-hero";
import { Marquee } from "@/components/common/marquee";
import { ScrollReveal } from "@/components/common/scroll-reveal";
import { MaskReveal } from "@/components/common/mask-reveal";
import { ParallaxImage } from "@/components/common/parallax-image";
import { CountUp } from "@/components/common/count-up";
import { Magnetic } from "@/components/common/magnetic";
import { HorizontalCategories } from "@/components/common/horizontal-categories";

const PROCESS = [
  { n: "01", title: "Centre signs up",   body: "Centres open registration and assign chest cards to students who want to compete." },
  { n: "02", title: "District auditions", body: "Judges visit district centres on assigned dates. Performances are evaluated live." },
  { n: "03", title: "National finale",   body: "Selected students perform on the National Stage in Kolkata before star judges." },
  { n: "04", title: "Prizes & records",  body: "Cash prizes, judge-signed certificates, and a shot at India-Level Records." },
];

export default function HomePage() {
  return (
    <>
      <VideoHero />
      <Marquee items={PAST_EVENT_TICKER} />

      {/* 01 — Intro · sticky eyebrow + count-up stats */}
      <section className="relative py-24 sm:py-32">
        <div className="container mx-auto grid gap-12 px-6 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="md:sticky md:top-28">
              <StickyLabel num="01" label="The event" />
              <p className="mt-6 text-sm text-white/55">
                Presented by Mind Mantra Abacus.
              </p>
            </div>
          </div>

          <div className="md:col-span-8">
            <MaskReveal
              as="h2"
              className="text-balance text-3xl font-black uppercase leading-[1.05] tracking-tight sm:text-5xl md:text-6xl"
            >
              A national stage for young performers across Eastern India.
            </MaskReveal>
            <ScrollReveal>
              <p className="mt-6 max-w-2xl text-base text-white/65 sm:text-lg">
                Dekhao Apna Talent brings dance, song, mental math and other talents under one banner.
                Every participant gets a special medal and a judge-signed certificate.
              </p>
            </ScrollReveal>
            <ScrollReveal stagger className="mt-12 grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
              <div data-reveal-item>
                <p className="text-3xl font-black sm:text-5xl">
                  <CountUp to={200} suffix="+" />
                </p>
                <p className="mt-2 text-[11px] uppercase tracking-wider text-white/50">Centres</p>
              </div>
              <div data-reveal-item>
                <p className="text-3xl font-black sm:text-5xl">
                  <CountUp to={14} prefix="6–" />
                </p>
                <p className="mt-2 text-[11px] uppercase tracking-wider text-white/50">Age group</p>
              </div>
              <div data-reveal-item>
                <p className="text-3xl font-black sm:text-5xl">
                  <CountUp to={5000} prefix="₹" />
                </p>
                <p className="mt-2 text-[11px] uppercase tracking-wider text-white/50">Top prize</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 02 — Horizontal pinned categories */}
      <HorizontalCategories />

      {/* 03 — Color-invert process strip */}
      <section className="relative border-t border-b border-black/10 bg-[#F5F1EA] py-24 text-black sm:py-32">
        <div className="container mx-auto px-6">
          <div className="grid gap-12 md:grid-cols-12">
            <div className="md:col-span-4">
              <div className="md:sticky md:top-28">
                <div className="inline-flex items-center gap-3">
                  <span className="font-mono text-[#FF5A1F]">03</span>
                  <span className="h-px w-10 bg-black/30" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-black/60">The journey</span>
                </div>
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
                  className={`grid grid-cols-[80px_1fr] gap-6 py-8 ${i > 0 ? "border-t border-black/10" : ""}`}
                >
                  <span className="text-4xl font-black text-[#FF5A1F]">{p.n}</span>
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">{p.title}</h3>
                    <p className="mt-2 text-black/65">{p.body}</p>
                  </div>
                </div>
              ))}
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 04 — Judges with parallax portraits */}
      <section className="relative border-t border-white/10 py-24 sm:py-32">
        <div className="container mx-auto grid gap-12 px-6 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="md:sticky md:top-28">
              <StickyLabel num="04" label="Star judges" />
              <MaskReveal
                as="h2"
                className="mt-6 text-3xl font-black uppercase leading-[1.05] tracking-tight sm:text-4xl"
              >
                Judged by faces you know.
              </MaskReveal>
              <ScrollReveal>
                <p className="mt-6 max-w-md text-white/65">
                  Performances at the national finale are judged by celebrated names from Bengali music and television.
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
                <ParallaxImage
                  src={j.src}
                  alt={j.name}
                  sizes="(max-width: 768px) 50vw, 33vw"
                  containerClassName="absolute inset-0"
                  className="object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                  amount={12}
                />
                <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black via-black/60 to-transparent p-5">
                  <p className="text-[11px] uppercase tracking-wider text-[#FF5A1F]">{j.role}</p>
                  <p className="mt-1 text-xl font-black uppercase tracking-tight">{j.name}</p>
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
              <StickyLabel num="05" label="Latest moments" />
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
              <Icon name="arrow_outward" size={18} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>

          <ScrollReveal stagger className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
          <StickyLabel num="06" label="Join us" centered />
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
              Open your centre&apos;s registration window now. Chest cards, judge feedback, certificates
              and a national-stage chance — all included.
            </p>
            <Magnetic className="mt-10 inline-block">
              <Button
                asChild
                size="lg"
                className="h-14 bg-[#FF5A1F] px-8 font-bold uppercase tracking-wider text-black hover:bg-[#ff6b35]"
              >
                <Link href="/register" className="inline-flex items-center gap-2">
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

function StickyLabel({ num, label, centered = false }: { num: string; label: string; centered?: boolean }) {
  return (
    <div className={`inline-flex items-center gap-3 ${centered ? "mx-auto" : ""}`}>
      <span className="font-mono text-[#FF5A1F]">{num}</span>
      <span className="h-px w-10 bg-white/30" />
      <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/70">{label}</span>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/common/icon";
import { LATEST_MOMENTS, JUDGES } from "@/constants/media";
import { VideoHero } from "@/components/common/video-hero";
import { Marquee } from "@/components/common/marquee";
import { ScrollReveal } from "@/components/common/scroll-reveal";
import { MaskReveal } from "@/components/common/mask-reveal";
import { CountUp } from "@/components/common/count-up";
import { Magnetic } from "@/components/common/magnetic";
import { HorizontalCategories } from "@/components/common/horizontal-categories";
import { Band, Wave, Doodles, Squiggle } from "@/components/common/playful";

const TICKER = [
  "Dance", "Sing", "Mind Math", "Magic", "Art", "Storytelling", "Acting", "Be a Star",
];

const PERKS = [
  { icon: "military_tech", color: "bg-crayon-sun",   title: "Shiny medal", body: "Every single participant takes home a special medal. No one goes empty-handed!" },
  { icon: "workspace_premium", color: "bg-crayon-grape", title: "Real certificate", body: "A judge-signed certificate to show your school, family and friends." },
  { icon: "stadium",       color: "bg-crayon-coral",  title: "National stage", body: "Top kids perform on a big lights-and-music stage in Kolkata." },
  { icon: "savings",       color: "bg-crayon-mint",   title: "Cash prizes",   body: "Win up to ₹5,000 plus exciting awards across every category." },
  { icon: "reviews",       color: "bg-crayon-sky",    title: "Star feedback", body: "Tips and cheers from famous singers and TV stars — just for you." },
  { icon: "diversity_3",   color: "bg-crayon-bubblegum", title: "New friends", body: "Meet talented kids from 200+ centres across Eastern India." },
];

const PROCESS = [
  { n: "1", color: "bg-crayon-coral", icon: "app_registration", title: "Sign up at a centre", body: "Join through your nearest Mind Mantra centre and get your very own chest card." },
  { n: "2", color: "bg-crayon-sun",   icon: "groups",           title: "Show your talent", body: "Perform in the district audition round in front of friendly judges." },
  { n: "3", color: "bg-crayon-mint",  icon: "celebration",      title: "Reach the finale", body: "Selected stars perform on the big National Stage in Kolkata." },
  { n: "4", color: "bg-crayon-grape", icon: "emoji_events",     title: "Win & celebrate", body: "Take home medals, certificates, cash prizes and a chance at records!" },
];

const PARENT_VOICES = [
  { name: "Ananya's Mom", role: "Parent · Howrah", quote: "My daughter was so shy. After the stage, she walks into school like a star. Best thing we ever did!", color: "text-crayon-coral" },
  { name: "Rohan, age 11", role: "Dance · Finalist", quote: "The lights, the judges, the crowd cheering — it felt like a real TV show. I want to do it again!", color: "text-crayon-grape" },
  { name: "Mr. Das", role: "Centre Owner · Durgapur", quote: "Registration was easy and the kids were thrilled. Parents keep asking when the next one starts.", color: "text-crayon-sky" },
];

const FAQ = [
  { q: "Who can join?", a: "Any child aged 6 to 14 can join through a participating Mind Mantra centre. All skill levels are welcome!" },
  { q: "What can my child perform?", a: "Dance, Song, Mental Math Olympiad, or any other special talent like magic, art, acting or storytelling." },
  { q: "Is it safe and supervised?", a: "Yes. Every round is organised through trusted centres with supervised, kid-friendly judging and clear guidelines." },
  { q: "Does everyone get something?", a: "Absolutely. Every participant receives a medal and a certificate — winning is a bonus, taking part is the real prize." },
  { q: "How do we register?", a: "Visit your nearest centre or ask them to register you online. Centres assign a chest card and you're ready to shine!" },
];

export default function HomePage() {
  return (
    <>
      <VideoHero />
      <Marquee items={TICKER} />

      {/* 01 — Perks */}
      <Band bg="white" to="butter" innerClassName="relative py-20 sm:py-28">
        <Doodles />
        <div className="container relative mx-auto px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow icon="redeem" label="Everyone's a winner" centered />
            <MaskReveal as="h2" className="mt-5 text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
              Every star takes home{" "}
              <Squiggle color="var(--c-sun)"><span className="text-gradient">something special.</span></Squiggle>
            </MaskReveal>
            <ScrollReveal>
              <p className="mt-5 text-lg text-muted-foreground">
                It&apos;s not just about winning — it&apos;s about shining bright and having tons of fun on the way.
              </p>
            </ScrollReveal>
          </div>

          <ScrollReveal stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PERKS.map((p) => (
              <div key={p.title} data-reveal-item className="lift rounded-3xl border-2 border-border bg-card p-6 shadow-pop">
                <span className={`inline-flex size-14 items-center justify-center rounded-2xl ${p.color} text-white shadow-pop-sm`}>
                  <span className="material-symbols-rounded" style={{ fontSize: 30, fontVariationSettings: "'FILL' 0" }}>{p.icon}</span>
                </span>
                <h3 className="mt-5 text-xl font-extrabold tracking-tight">{p.title}</h3>
                <p className="mt-2 text-muted-foreground">{p.body}</p>
              </div>
            ))}
          </ScrollReveal>
        </div>
      </Band>

      {/* 02 — Categories (pinned horizontal, butter band) */}
      <HorizontalCategories />

      {/* 03 — Stats band (rainbow) */}
      <section className="relative isolate overflow-hidden bg-brand-gradient pt-16 pb-2 sm:pt-20">
        <Doodles className="opacity-40" />
        <div className="container relative mx-auto px-6">
          <ScrollReveal stagger className="grid grid-cols-2 gap-8 text-center text-white md:grid-cols-4">
            <Stat to={200} suffix="+" label="Centres" />
            <Stat to={5000} prefix="₹" label="Top prize" />
            <Stat to={14} prefix="6–" label="Age group" />
            <Stat to={4} label="Categories" />
          </ScrollReveal>
        </div>
        <Wave to="mint" />
      </section>

      {/* 04 — How it works */}
      <Band bg="mint" to="white" innerClassName="relative py-20 sm:py-28">
        <Doodles />
        <div className="container relative mx-auto px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow icon="map" label="Your journey" centered />
            <MaskReveal as="h2" className="mt-5 text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
              From your centre to the{" "}
              <Squiggle color="var(--c-coral)"><span className="text-gradient">big stage!</span></Squiggle>
            </MaskReveal>
          </div>

          <ScrollReveal stagger className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((p) => (
              <div key={p.n} data-reveal-item className="lift relative rounded-3xl border-2 border-border bg-card p-6 pt-8 shadow-pop">
                <span className={`absolute -top-5 left-6 inline-flex size-12 items-center justify-center rounded-2xl ${p.color} font-display text-2xl font-extrabold text-white shadow-pop-sm`}>
                  {p.n}
                </span>
                <span className="material-symbols-rounded text-foreground/80" style={{ fontSize: 40 }}>{p.icon}</span>
                <h3 className="mt-3 text-xl font-extrabold tracking-tight">{p.title}</h3>
                <p className="mt-2 text-muted-foreground">{p.body}</p>
              </div>
            ))}
          </ScrollReveal>
        </div>
      </Band>

      {/* 05 — Star judges */}
      <Band bg="white" to="pink" innerClassName="relative py-20 sm:py-28">
        <div className="container relative mx-auto grid gap-12 px-6 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="md:sticky md:top-28">
              <Eyebrow icon="star" label="Star judges" />
              <MaskReveal as="h2" className="mt-5 text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl">
                Judged by faces you{" "}
                <Squiggle color="var(--c-grape)"><span className="text-gradient">know & love.</span></Squiggle>
              </MaskReveal>
              <ScrollReveal>
                <p className="mt-5 max-w-md text-muted-foreground">
                  Perform at the national finale in front of celebrated stars of Bengali music and television — and get their cheers and tips!
                </p>
              </ScrollReveal>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:col-span-8">
            {JUDGES.map((j) => (
              <div key={j.name} className="group relative aspect-[3/4] overflow-hidden rounded-3xl border-4 border-card shadow-pop">
                <Image
                  src={j.src}
                  alt={j.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-foreground via-foreground/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 z-20 p-5">
                  <p className="inline-flex rounded-full bg-card/90 px-3 py-1 text-[11px] font-bold text-crayon-grape backdrop-blur">{j.role}</p>
                  <p className="mt-2 text-xl font-extrabold tracking-tight text-white">{j.name}</p>
                  <p className="mt-1 max-h-0 translate-y-2 overflow-hidden text-sm leading-snug text-white/85 opacity-0 transition-all duration-500 ease-out group-hover:max-h-28 group-hover:translate-y-0 group-hover:opacity-100">{j.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Band>

      {/* 06 — Gallery preview */}
      <Band bg="pink" to="grape" innerClassName="relative py-20 sm:py-28">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow icon="photo_camera" label="Latest moments" />
              <MaskReveal as="h2" className="mt-5 text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
                Look at all the{" "}
                <Squiggle color="var(--c-mint)"><span className="text-gradient">happy faces!</span></Squiggle>
              </MaskReveal>
            </div>
            <Button asChild variant="outline" size="lg" className="font-display font-bold">
              <Link href="/gallery" className="inline-flex items-center gap-2">
                See full gallery
                <Icon name="arrow_forward" size={18} />
              </Link>
            </Button>
          </div>

          <ScrollReveal stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LATEST_MOMENTS.map((p) => (
              <Link key={p.id} data-reveal-item href="/gallery" className="group lift relative block aspect-[4/3] overflow-hidden rounded-3xl border-4 border-card shadow-pop">
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  sizes="(max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
                />
                <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-[11px] font-extrabold text-crayon-grape shadow-pop-sm backdrop-blur">{p.tag}</span>
                <span className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-foreground via-foreground/70 to-transparent p-4 text-sm font-medium text-white transition-transform duration-500 group-hover:translate-y-0">{p.alt}</span>
              </Link>
            ))}
          </ScrollReveal>
        </div>
      </Band>

      {/* 07 — Parent & kid voices (dark band for contrast) */}
      <Band bg="ink" innerClassName="relative py-20 sm:py-28">
        <Doodles />
        <div className="container relative mx-auto px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow icon="favorite" label="Why families love it" centered />
            <MaskReveal as="h2" className="mt-5 text-3xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl">
              Confidence that lasts{" "}
              <Squiggle color="var(--c-sun)"><span className="text-gradient">long after the stage.</span></Squiggle>
            </MaskReveal>
          </div>

          <ScrollReveal stagger className="mt-14 grid gap-5 md:grid-cols-3">
            {PARENT_VOICES.map((t) => (
              <figure key={t.name} data-reveal-item className="lift flex flex-col rounded-3xl border-2 border-border bg-card p-6 shadow-pop">
                <span className={`material-symbols-rounded ${t.color}`} style={{ fontSize: 40, fontVariationSettings: "'FILL' 0" }}>format_quote</span>
                <blockquote className="mt-2 flex-1 text-lg font-medium leading-snug text-foreground">“{t.quote}”</blockquote>
                <figcaption className="mt-5 border-t-2 border-border pt-4">
                  <p className="font-extrabold">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                </figcaption>
              </figure>
            ))}
          </ScrollReveal>
        </div>
      </Band>

      {/* 08 — FAQ */}
      <Band bg="sky" to="cream" innerClassName="relative py-20 sm:py-28">
        <div className="container relative mx-auto max-w-3xl px-6">
          <div className="text-center">
            <Eyebrow icon="help" label="Got questions?" centered />
            <MaskReveal as="h2" className="mt-5 text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
              Quick answers for{" "}
              <Squiggle color="var(--c-coral)"><span className="text-gradient">grown-ups.</span></Squiggle>
            </MaskReveal>
          </div>

          <div className="mt-12 space-y-4">
            {FAQ.map((f) => (
              <details key={f.q} className="group rounded-3xl border-2 border-border bg-card p-5 shadow-pop-sm [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-lg font-extrabold tracking-tight">
                  {f.q}
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-foreground transition-transform group-open:rotate-45">
                    <span className="material-symbols-rounded" style={{ fontSize: 22 }}>add</span>
                  </span>
                </summary>
                <p className="mt-3 text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </Band>

      {/* 09 — Final CTA */}
      <section className="relative isolate overflow-hidden bg-band-cream py-24 sm:py-32">
        <Doodles />
        <div className="container relative mx-auto px-6">
          <div className="mx-auto max-w-4xl rounded-[2.5rem] border-4 border-card bg-brand-gradient p-10 text-center text-white shadow-pop sm:p-16">
            <span className="material-symbols-rounded animate-wiggle" style={{ fontSize: 56, fontVariationSettings: "'FILL' 0" }}>celebration</span>
            <MaskReveal as="h2" byChar stagger={0.03} className="mx-auto mt-4 block text-balance text-4xl font-extrabold leading-[1.0] tracking-tight sm:text-6xl">
              Your stage is waiting!
            </MaskReveal>
            <ScrollReveal>
              <p className="mx-auto mt-5 max-w-xl text-lg text-white/90">
                Medals, judge feedback, certificates and a national-stage chance — all the fun is included. Join through your nearest Mind Mantra centre!
              </p>
              <Magnetic className="mt-9 inline-block">
                <Button asChild variant="candy" size="xl" className="bg-card text-crayon-grape hover:brightness-100">
                  <Link href="/categories" className="inline-flex items-center gap-2">
                    Explore the categories
                    <Icon name="arrow_forward" size={20} />
                  </Link>
                </Button>
              </Magnetic>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
}

function Eyebrow({ icon, label, centered = false }: { icon: string; label: string; centered?: boolean }) {
  return (
    <div className={`inline-flex items-center gap-2 rounded-full bg-card px-4 py-1.5 shadow-pop-sm ${centered ? "mx-auto" : ""}`}>
      <span className="material-symbols-rounded text-crayon-sun" style={{ fontSize: 18, fontVariationSettings: "'FILL' 0" }}>{icon}</span>
      <span className="font-fun text-base font-semibold text-crayon-grape">{label}</span>
    </div>
  );
}

function Stat({ to, prefix, suffix, label }: { to: number; prefix?: string; suffix?: string; label: string }) {
  return (
    <div data-reveal-item>
      <p className="font-display text-4xl font-extrabold sm:text-6xl">
        <CountUp to={to} prefix={prefix} suffix={suffix} />
      </p>
      <p className="mt-2 font-fun text-sm font-semibold uppercase tracking-wider text-white/85">{label}</p>
    </div>
  );
}

import Image from "next/image";
import { EVENT_NAME } from "@/constants";
import { JUDGES } from "@/constants/media";
import { PageHero } from "@/components/common/page-hero";
import { ScrollReveal } from "@/components/common/scroll-reveal";
import { Band, Doodles, Squiggle } from "@/components/common/playful";
import { Icon } from "@/components/common/icon";

export const metadata = { title: "About the Event" };

const JOURNEY = [
  { icon: "groups", color: "bg-crayon-coral", title: "District auditions", body: "The judges' team visits district centres on set dates and watches every performance live." },
  { icon: "stadium", color: "bg-crayon-grape", title: "National finale", body: "Selected stars perform on the big National Stage in Kolkata, judged by Bengali television stars." },
];

const PERKS = [
  { icon: "workspace_premium", color: "text-crayon-grape", label: "A judge-signed certificate" },
  { icon: "military_tech", color: "text-crayon-sun", label: "A special shiny medal" },
  { icon: "stadium", color: "text-crayon-coral", label: "A spot on the national stage" },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title={<>All about <span className="text-gradient">{EVENT_NAME}!</span></>}
        subtitle="Eastern India's most fun national-stage talent contest for kids aged 6–14."
        nextBg="white"
      />

      {/* Mission */}
      <Band bg="white" to="sky" innerClassName="relative py-20 sm:py-24">
        <Doodles />
        <div className="container relative mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl">
            A real stage for <Squiggle color="var(--c-sun)"><span className="text-gradient">every young talent.</span></Squiggle>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
            Dekhao Apna Talent is presented with love by Mind Mantra Abacus. It brings dance, song, mental
            math and other talents under one happy national-stage platform — giving students from district
            centres a real chance to perform in front of star judges.
          </p>
        </div>
      </Band>

      {/* Two-stage journey */}
      <Band bg="sky" to="white" innerClassName="relative py-20 sm:py-24">
        <div className="container relative mx-auto max-w-5xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">The two-stage journey</h2>
          </div>
          <ScrollReveal stagger className="mt-12 grid gap-6 md:grid-cols-2">
            {JOURNEY.map((j) => (
              <div key={j.title} data-reveal-item className="lift rounded-3xl border-2 border-border bg-card p-7 shadow-pop">
                <span className={`inline-flex size-14 items-center justify-center rounded-2xl ${j.color} text-white shadow-pop-sm`}>
                  <span className="material-symbols-rounded" style={{ fontSize: 30, fontVariationSettings: "'FILL' 0" }}>{j.icon}</span>
                </span>
                <h3 className="mt-5 text-2xl font-extrabold tracking-tight">{j.title}</h3>
                <p className="mt-2 text-muted-foreground">{j.body}</p>
              </div>
            ))}
          </ScrollReveal>
        </div>
      </Band>

      {/* Judges */}
      <Band bg="white" to="pink" innerClassName="relative py-20 sm:py-24">
        <div className="container relative mx-auto max-w-5xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Our <Squiggle color="var(--c-grape)"><span className="text-gradient">special judges</span></Squiggle>
            </h2>
            <p className="mt-4 text-muted-foreground">…and many more stars from popular television shows.</p>
          </div>
          <div className="mx-auto mt-12 grid max-w-md grid-cols-2 gap-5">
            {JUDGES.map((j) => (
              <figure key={j.name} className="group">
                <div className="relative aspect-[3/4] overflow-hidden rounded-3xl border-4 border-card shadow-pop">
                  <Image
                    src={j.src}
                    alt={j.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 220px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <figcaption className="mt-3 text-center">
                  <p className="text-lg font-extrabold tracking-tight">{j.name}</p>
                  <p className="font-fun text-sm font-semibold text-crayon-grape">{j.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </Band>

      {/* Every participant + records */}
      <Band bg="pink" innerClassName="relative py-20 sm:py-28">
        <Doodles />
        <div className="container relative mx-auto max-w-5xl px-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border-2 border-border bg-card p-8 shadow-pop">
              <h3 className="text-2xl font-extrabold tracking-tight">Every participant receives</h3>
              <ul className="mt-6 space-y-4">
                {PERKS.map((p) => (
                  <li key={p.label} className="flex items-center gap-3 text-lg font-medium">
                    <span className={`material-symbols-rounded ${p.color}`} style={{ fontSize: 28, fontVariationSettings: "'FILL' 0" }}>{p.icon}</span>
                    {p.label}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col justify-center rounded-3xl bg-brand-gradient p-8 text-white shadow-pop">
              <Icon name="emoji_events" size={44} filled />
              <h3 className="mt-4 text-2xl font-extrabold tracking-tight">India-Level Records</h3>
              <p className="mt-2 text-white/90">
                The top 5 abacus students get a chance to attempt India-Level Records by Mind Mantra Abacus!
              </p>
            </div>
          </div>
        </div>
      </Band>
    </>
  );
}

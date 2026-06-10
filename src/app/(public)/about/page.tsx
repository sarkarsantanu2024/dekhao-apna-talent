import Image from "next/image";
import { EVENT_NAME } from "@/constants";
import { JUDGES } from "@/constants/media";
import { PageHero } from "@/components/common/page-hero";
import { ScrollReveal } from "@/components/common/scroll-reveal";

export const metadata = { title: "About the Event" };

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title={<>About <span className="text-gradient">{EVENT_NAME}.</span></>}
        subtitle="Eastern India's biggest national-stage talent contest for students aged 6–14."
      />

      <section className="border-t border-white/10 py-20">
        <ScrollReveal stagger className="container mx-auto max-w-4xl space-y-12 px-6">
          <Block data-reveal-item heading="The mission">
            Dekhao Apna Talent is presented by Mind Mantra Abacus. It brings dance, song, mental math
            and other talent categories under a single national-stage platform, giving students from
            district centres a real shot at performing in front of star judges.
          </Block>

          <Block data-reveal-item heading="Two-stage journey">
            <ul className="space-y-3 text-white/75">
              <li className="flex gap-3"><span className="mt-2.5 inline-block size-1.5 shrink-0 rounded-full bg-brand-gradient" /> District-wise auditions by the judges&apos; team on specific dates.</li>
              <li className="flex gap-3"><span className="mt-2.5 inline-block size-1.5 shrink-0 rounded-full bg-brand-gradient" /> National stage finale in Kolkata, judged by Bengali television stars.</li>
            </ul>
          </Block>

          <Block data-reveal-item heading="Special judges">
            <div className="grid max-w-md grid-cols-2 gap-4">
              {JUDGES.map((j) => (
                <figure key={j.name} className="group">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-white/10">
                    <Image
                      src={j.src}
                      alt={j.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 220px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <figcaption className="mt-3">
                    <p className="font-bold text-white">{j.name}</p>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gradient">
                      {j.role}
                    </p>
                  </figcaption>
                </figure>
              ))}
            </div>
            <p className="mt-5 text-base text-white/65">
              …and many more special judges from popular television shows.
            </p>
          </Block>

          <Block data-reveal-item heading="Every participant receives">
            <ul className="space-y-2 text-white/70">
              <li><span className="text-gradient">·</span> A judge-signed certificate.</li>
              <li><span className="text-gradient">·</span> A special medal.</li>
              <li><span className="text-gradient">·</span> The opportunity to perform on a national-stage platform.</li>
            </ul>
          </Block>

          <Block data-reveal-item heading="India-Level Records">
            The top 5 abacus students are given a chance to attempt India-Level Records by Mind Mantra Abacus.
          </Block>
        </ScrollReveal>
      </section>
    </>
  );
}

function Block({
  heading,
  children,
  ...rest
}: { heading: string; children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...rest} className="grid gap-4 border-t border-white/10 pt-8 md:grid-cols-[220px_1fr]">
      <h3 className="font-script text-2xl leading-none text-gradient sm:text-3xl">{heading}</h3>
      <div className="text-lg text-white/80 sm:text-xl">{children}</div>
    </div>
  );
}

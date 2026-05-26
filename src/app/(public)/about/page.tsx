import { EVENT_NAME } from "@/constants";
import { PageHero } from "@/components/common/page-hero";
import { ScrollReveal } from "@/components/common/scroll-reveal";

export const metadata = { title: "About the Event" };

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title={<>About <span className="text-[#FF5A1F]">{EVENT_NAME}.</span></>}
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
            <ul className="space-y-2 text-white/70">
              <li><span className="text-[#FF5A1F]">01 ·</span> District-wise auditions by the judges&apos; team on specific dates.</li>
              <li><span className="text-[#FF5A1F]">02 ·</span> National stage finale in Kolkata, judged by Bengali television stars.</li>
            </ul>
          </Block>

          <Block data-reveal-item heading="Special judges">
            <span className="text-white">Indrani Sen</span> (Bengali playback singer),{" "}
            <span className="text-white">Sonamoni Saha</span> (TV actress) — and many more from popular television shows.
          </Block>

          <Block data-reveal-item heading="Every participant receives">
            <ul className="space-y-2 text-white/70">
              <li><span className="text-[#FF5A1F]">·</span> A judge-signed certificate.</li>
              <li><span className="text-[#FF5A1F]">·</span> A special medal.</li>
              <li><span className="text-[#FF5A1F]">·</span> The opportunity to perform on a national-stage platform.</li>
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
    <div {...rest} className="grid gap-4 border-t border-white/10 pt-8 md:grid-cols-[200px_1fr]">
      <h3 className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/50">{heading}</h3>
      <div className="text-lg text-white/80">{children}</div>
    </div>
  );
}

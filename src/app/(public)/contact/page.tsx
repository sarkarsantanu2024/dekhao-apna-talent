import { PageHero } from "@/components/common/page-hero";
import { ScrollReveal } from "@/components/common/scroll-reveal";
import { Icon } from "@/components/common/icon";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={<>Get in <span className="text-[#FF5A1F]">touch.</span></>}
        subtitle="Centre owners and parents can reach us through any of the channels below."
      />
      <section className="border-t border-white/10 py-20">
        <div className="container mx-auto max-w-4xl px-6">
          <ScrollReveal stagger className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-3">
            <ContactCard num="01" iconName="call"        title="Call us" value="+91 — coming soon" />
            <ContactCard num="02" iconName="mail"        title="Email"   value="info@dekhaoapnatalent.com" />
            <ContactCard num="03" iconName="location_on" title="Office"  value="Mind Mantra Abacus, Kolkata" />
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}

function ContactCard({
  num,
  iconName,
  title,
  value,
}: {
  num: string;
  iconName: string;
  title: string;
  value: string;
}) {
  return (
    <div data-reveal-item className="group bg-black p-8 transition-colors hover:bg-[#0F0F14]">
      <span className="font-mono text-xs text-white/40">{num}</span>
      <Icon name={iconName} size={28} className="mt-8 text-[#FF5A1F]" />
      <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.22em] text-white/50">{title}</p>
      <p className="mt-2 text-lg font-bold text-white">{value}</p>
    </div>
  );
}

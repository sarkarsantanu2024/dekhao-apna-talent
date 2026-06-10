import { PageHero } from "@/components/common/page-hero";
import { ScrollReveal } from "@/components/common/scroll-reveal";
import { Icon } from "@/components/common/icon";
import { Decor } from "@/components/common/decor";
import { ContactForm } from "@/components/forms/contact-form";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={<>Get in <span className="text-gradient">touch.</span></>}
        subtitle="Centre owners and parents can reach us through any of the channels below."
      />

      {/* Contact channels */}
      <section className="relative overflow-hidden border-t border-white/10 py-16 sm:py-20">
        <Decor dots={false} />
        <div className="container relative mx-auto max-w-6xl px-6">
          <ScrollReveal stagger className="grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 md:grid-cols-3">
            <ContactCard iconName="call"        title="Call us" value="+91 — coming soon" />
            <ContactCard iconName="mail"        title="Email"   value="info@dekhaoapnatalent.com" />
            <ContactCard iconName="location_on" title="Office"  value="Mind Mantra Abacus, Kolkata" />
          </ScrollReveal>
        </div>
      </section>

      {/* Enquiry form + map */}
      <section className="relative overflow-hidden border-t border-white/10 py-16 sm:py-24">
        <Decor blobs={false} />
        <div className="container relative mx-auto max-w-6xl px-6">
          <div className="grid items-stretch gap-8 lg:grid-cols-2">
            {/* Form */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 sm:p-9">
              <span className="font-script text-3xl text-gradient sm:text-4xl">Send a message</span>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-tight sm:text-3xl">
                Enquiry form
              </h2>
              <p className="mt-3 mb-7 text-base text-white/65">
                Have a question about registration, fees or auditions? Drop us a line.
              </p>
              <ContactForm />
            </div>

            {/* Map */}
            <div className="relative min-h-[420px] overflow-hidden rounded-3xl border border-white/10">
              <iframe
                title="Mind Mantra Abacus, Kolkata"
                src="https://www.google.com/maps?q=Mind+Mantra+Abacus+Kolkata&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full grayscale-[0.3] invert-[0.92] hue-rotate-180"
              />
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-[#A855F7]/20" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function ContactCard({
  iconName,
  title,
  value,
}: {
  iconName: string;
  title: string;
  value: string;
}) {
  return (
    <div data-reveal-item className="group bg-black p-8 transition-colors hover:bg-[#0F0F14]">
      <Icon name={iconName} size={32} className="text-gradient" />
      <p className="mt-8 text-xs font-bold uppercase tracking-[0.22em] text-white/55">{title}</p>
      <p className="mt-2 text-lg font-bold text-white">{value}</p>
    </div>
  );
}

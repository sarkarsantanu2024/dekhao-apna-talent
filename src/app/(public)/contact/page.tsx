import { Phone, Mail, MapPin } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageHero } from "@/components/common/page-hero";
import { ScrollReveal } from "@/components/common/scroll-reveal";
import { Band } from "@/components/common/playful";
import { ContactForm } from "@/components/forms/contact-form";

export const metadata = { title: "Contact" };

const CHANNELS: { Icon: LucideIcon; title: string; value: string }[] = [
  { Icon: Phone, title: "Call us", value: "+91 — coming soon" },
  { Icon: Mail, title: "Email", value: "info@dekhaoapnatalent.com" },
  { Icon: MapPin, title: "Office", value: "17/K/6, Dakhindari Road, Near Ultadanga, Kolkata – 700048" },
];

const MAP_QUERY = "17/K/6, Dakhindari Road, Near Ultadanga, Kolkata 700048";

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={<>Say <span className="text-gradient">hello.</span></>}
        subtitle="Centre owners and parents can reach us through any of the channels below — we'd love to hear from you."
      />

      {/* Contact channels */}
      <Band bg="cream" innerClassName="relative py-16 sm:py-20">
        <div className="container relative mx-auto max-w-6xl px-6">
          <ScrollReveal stagger className="grid gap-6 md:grid-cols-3">
            {CHANNELS.map((c) => (
              <div key={c.title} data-reveal-item className="lift rounded-2xl border border-ink/10 bg-card p-8 shadow-pop-sm">
                <span className="inline-flex size-12 items-center justify-center rounded-full bg-secondary text-gold-deep">
                  <c.Icon className="size-5" strokeWidth={1.75} />
                </span>
                <p className="eyebrow mt-6 text-muted-foreground">{c.title}</p>
                <p className="mt-2 text-lg font-medium leading-snug text-foreground">{c.value}</p>
              </div>
            ))}
          </ScrollReveal>
        </div>
      </Band>

      {/* Enquiry form + map */}
      <Band bg="white" innerClassName="relative py-16 sm:py-24">
        <div className="container relative mx-auto max-w-6xl px-6">
          <div className="grid items-stretch gap-8 lg:grid-cols-2">
            {/* Form */}
            <div className="rounded-2xl border border-ink/10 bg-card p-8 shadow-pop-sm sm:p-10">
              <span className="eyebrow text-gold-deep">Send a message</span>
              <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl">Enquiry form</h2>
              <p className="mb-8 mt-3 leading-relaxed text-muted-foreground">
                Have a question about registration, fees or auditions? Drop us a line.
              </p>
              <ContactForm />
            </div>

            {/* Map */}
            <div className="relative min-h-[420px] overflow-hidden rounded-2xl border border-ink/10 shadow-pop-sm">
              <iframe
                title="Mind Mantra Abacus, Dakhindari Road, Kolkata"
                src={`https://www.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </div>
        </div>
      </Band>
    </>
  );
}

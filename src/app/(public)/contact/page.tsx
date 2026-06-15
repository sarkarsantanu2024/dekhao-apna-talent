import { PageHero } from "@/components/common/page-hero";
import { ScrollReveal } from "@/components/common/scroll-reveal";
import { Band, Doodles } from "@/components/common/playful";
import { ContactForm } from "@/components/forms/contact-form";

export const metadata = { title: "Contact" };

const CHANNELS = [
  { icon: "call", color: "bg-crayon-coral", title: "Call us", value: "+91 — coming soon" },
  { icon: "mail", color: "bg-crayon-grape", title: "Email", value: "info@dekhaoapnatalent.com" },
  { icon: "location_on", color: "bg-crayon-sky", title: "Office", value: "17/K/6, Dakhindari Road, Near Ultadanga, Kolkata – 700048" },
];

const MAP_QUERY = "17/K/6, Dakhindari Road, Near Ultadanga, Kolkata 700048";

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={<>Say <span className="text-gradient">hello!</span></>}
        subtitle="Centre owners and parents can reach us through any of the friendly channels below."
        nextBg="cream"
      />

      {/* Contact channels */}
      <Band bg="cream" to="sky" innerClassName="relative py-16 sm:py-20">
        <Doodles />
        <div className="container relative mx-auto max-w-6xl px-6">
          <ScrollReveal stagger className="grid gap-6 md:grid-cols-3">
            {CHANNELS.map((c) => (
              <div key={c.title} data-reveal-item className="lift rounded-3xl border-2 border-border bg-card p-7 text-center shadow-pop">
                <span className={`mx-auto inline-flex size-14 items-center justify-center rounded-2xl ${c.color} text-white shadow-pop-sm`}>
                  <span className="material-symbols-rounded" style={{ fontSize: 30, fontVariationSettings: "'FILL' 0" }}>{c.icon}</span>
                </span>
                <p className="mt-5 font-fun text-sm font-semibold text-muted-foreground">{c.title}</p>
                <p className="mt-1 text-lg font-bold text-foreground">{c.value}</p>
              </div>
            ))}
          </ScrollReveal>
        </div>
      </Band>

      {/* Enquiry form + map */}
      <Band bg="sky" innerClassName="relative py-16 sm:py-24">
        <div className="container relative mx-auto max-w-6xl px-6">
          <div className="grid items-stretch gap-8 lg:grid-cols-2">
            {/* Form */}
            <div className="rounded-3xl border-2 border-border bg-card p-7 shadow-pop sm:p-9">
              <span className="font-fun text-base font-semibold text-crayon-grape">Send a message</span>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">Enquiry form</h2>
              <p className="mb-7 mt-3 text-muted-foreground">
                Have a question about registration, fees or auditions? Drop us a line!
              </p>
              <ContactForm />
            </div>

            {/* Map */}
            <div className="relative min-h-[420px] overflow-hidden rounded-3xl border-4 border-card shadow-pop">
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

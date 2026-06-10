import Link from "next/link";
import { Star } from "lucide-react";
import { EVENT_NAME } from "@/constants";

// Free dance image (Pexels) used as the brand-panel backdrop.
const BRAND_IMG =
  "https://images.pexels.com/photos/2102568/pexels-photo-2102568.jpeg?auto=compress&cs=tinysrgb&w=1200";

const STATS = [
  { value: "200+", label: "Centres" },
  { value: "6–14", label: "Ages" },
  { value: "₹5,000", label: "Top prize" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0a0710] text-white">
      {/* Ambient floating blobs */}
      <div className="pointer-events-none absolute -left-40 -top-40 -z-0 size-[34rem] rounded-full bg-[#8b5cf6]/30 blur-[130px] animate-float" />
      <div
        className="pointer-events-none absolute -bottom-48 -right-40 -z-0 size-[36rem] rounded-full bg-[#ec4899]/25 blur-[140px] animate-float"
        style={{ animationDelay: "1.6s" }}
      />

      {/* Logo */}
      <header className="absolute inset-x-0 top-0 z-30">
        <div className="container mx-auto flex h-20 items-center px-6">
          <Link href="/" className="group flex items-center gap-2 font-black uppercase tracking-[0.14em]">
            <span className="inline-flex size-9 items-center justify-center rounded-full bg-brand-gradient transition-transform group-hover:rotate-90">
              <Star className="size-4 text-white" fill="currentColor" />
            </span>
            {EVENT_NAME}
          </Link>
        </div>
      </header>

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
        {/* ── Left brand panel ── */}
        <aside className="relative hidden overflow-hidden lg:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={BRAND_IMG}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#0a0710] via-[#0a0710]/70 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(168,85,247,0.35),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(236,72,153,0.3),transparent_55%)]" />

          {/* Rotating neon ring */}
          <div className="absolute left-1/2 top-1/2 size-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 animate-spin-slow [background:conic-gradient(from_0deg,transparent,rgba(168,85,247,0.7),transparent_40%,rgba(236,72,153,0.7),transparent_70%)] [mask:radial-gradient(circle,transparent_57%,#000_59%)]" />

          {/* Dot grid accent */}
          <div className="absolute right-12 top-28 grid grid-cols-4 gap-2.5 opacity-40">
            {Array.from({ length: 16 }).map((_, i) => (
              <span key={i} className="size-1.5 rounded-full bg-white/50" />
            ))}
          </div>

          {/* Content */}
          <div className="relative z-10 flex h-full flex-col justify-end p-12 xl:p-16">
            <span className="font-script text-4xl leading-none text-gradient">Become who you are</span>
            <h2 className="mt-4 max-w-md text-balance text-5xl font-black uppercase leading-[0.95] tracking-tight xl:text-6xl">
              Step onto the <span className="text-gradient">national</span> stage.
            </h2>
            <p className="mt-5 max-w-sm text-white/70">
              Manage centres, students and payments for {EVENT_NAME} — all in one portal.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              {STATS.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur"
                >
                  <p className="text-2xl font-black text-gradient">{s.value}</p>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Right form panel ── */}
        <main className="relative flex items-center justify-center px-6 py-28">
          {/* glow behind the card */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 -z-0 size-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#a855f7]/15 blur-[90px]" />
          <div className="relative z-10 w-full max-w-md">{children}</div>
        </main>
      </div>
    </div>
  );
}

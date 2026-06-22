"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  Camera, Film, Clapperboard, Trophy, Users, Music, MicVocal,
  Calculator, Sparkles, LayoutGrid, Play, X, Smile,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  GALLERY_PHOTOS,
  GALLERY_VIDEOS,
  GALLERY_SHORTS,
  GALLERY_YEARS,
  GALLERY_SECTIONS,
  type GalleryPhoto,
  type GalleryTag,
  type GalleryYear,
} from "@/constants/media";
import { ScrollReveal } from "@/components/common/scroll-reveal";

type Kind = "photos" | "videos" | "reels";
type YearFilter = "All" | GalleryYear;
type SectionFilter = "All" | GalleryTag;

const KINDS: { id: Kind; label: string; Icon: LucideIcon }[] = [
  { id: "photos", label: "Photos", Icon: Camera },
  { id: "videos", label: "Videos", Icon: Film },
  { id: "reels", label: "Reels", Icon: Clapperboard },
];

const SECTION_ICON: Record<GalleryTag, LucideIcon> = {
  Finale: Trophy,
  Auditions: Users,
  Dance: Music,
  Song: MicVocal,
  Math: Calculator,
  Other: Sparkles,
};

export function GalleryView() {
  const [kind, setKind] = useState<Kind>("photos");
  const [year, setYear] = useState<YearFilter>("All");
  const [section, setSection] = useState<SectionFilter>("All");
  const [lightbox, setLightbox] = useState<GalleryPhoto | null>(null);
  const [video, setVideo] = useState<{ src: string; title: string } | null>(null);

  const byYearSection = <T extends { year?: GalleryYear; tag?: GalleryTag }>(items: T[]) =>
    items.filter(
      (it) =>
        (year === "All" || it.year === year) &&
        (section === "All" || it.tag === section),
    );

  const photos = useMemo(() => byYearSection(GALLERY_PHOTOS), [year, section]);
  const videos = useMemo(() => byYearSection(GALLERY_VIDEOS), [year, section]);
  const reels = useMemo(() => byYearSection(GALLERY_SHORTS), [year, section]);

  const current = kind === "photos" ? photos : kind === "videos" ? videos : reels;

  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="container mx-auto px-6">
        {/* ── Filter panel ────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-ink/10 bg-card p-5 shadow-pop-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Year */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="eyebrow mr-1 text-muted-foreground">Year</span>
              <Pill active={year === "All"} onClick={() => setYear("All")}>All</Pill>
              {GALLERY_YEARS.map((y) => (
                <Pill key={y} active={year === y} onClick={() => setYear(y)}>{y}</Pill>
              ))}
            </div>
            {/* Kind */}
            <div className="inline-flex self-start rounded-full border border-border p-1">
              {KINDS.map((k) => (
                <button
                  key={k.id}
                  onClick={() => setKind(k.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                    kind === k.id ? "bg-ink text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <k.Icon className="size-4" strokeWidth={1.75} />
                  {k.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sections */}
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
            <span className="eyebrow mr-1 text-muted-foreground">Section</span>
            <Chip active={section === "All"} onClick={() => setSection("All")} Icon={LayoutGrid}>All</Chip>
            {GALLERY_SECTIONS.map((s) => (
              <Chip key={s} active={section === s} onClick={() => setSection(s)} Icon={SECTION_ICON[s]}>{s}</Chip>
            ))}
          </div>
        </div>

        {/* count */}
        <p className="mt-6 text-sm text-muted-foreground">
          {current.length} {kind} {year !== "All" ? `from ${year}` : "from all editions"}
          {section !== "All" ? ` · ${section}` : ""}
        </p>

        {/* ── Empty state ─────────────────────────────────────────────── */}
        {current.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-14 text-center">
            <Smile className="mx-auto size-10 text-gold-deep" strokeWidth={1.5} />
            <p className="mt-4 font-display text-lg font-semibold">Nothing here yet.</p>
            <p className="mt-1 text-muted-foreground">Try another year or section — more moments coming soon.</p>
          </div>
        )}

        {/* ── Photos grid ─────────────────────────────────────────────── */}
        {kind === "photos" && photos.length > 0 && (
          <ScrollReveal stagger key={`photos-${year}-${section}`} className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((p) => {
              const TagIcon = SECTION_ICON[p.tag];
              return (
                <button
                  key={p.id}
                  data-reveal-item
                  onClick={() => setLightbox(p)}
                  className="group lift relative block aspect-[4/3] overflow-hidden rounded-2xl bg-ink shadow-pop-sm"
                >
                  <Image
                    src={p.src}
                    alt={p.alt}
                    fill
                    sizes="(max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-[1.1s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                  />
                  <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-background/85 px-3 py-1 text-[11px] font-semibold text-foreground backdrop-blur">
                    <TagIcon className="size-3" strokeWidth={2} />
                    {p.tag}
                  </span>
                  {p.year && (
                    <span className="absolute right-4 top-4 rounded-full bg-ink/75 px-2.5 py-1 text-[11px] font-medium text-[#f3ead9] backdrop-blur">
                      {p.year}
                    </span>
                  )}
                  <span className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-ink via-ink/70 to-transparent p-4 text-left text-sm font-medium text-[#f8f1e3] transition-transform duration-300 group-hover:translate-y-0">
                    {p.alt}
                  </span>
                </button>
              );
            })}
          </ScrollReveal>
        )}

        {/* ── Videos grid ─────────────────────────────────────────────── */}
        {kind === "videos" && videos.length > 0 && (
          <ScrollReveal stagger key={`videos-${year}-${section}`} className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((v) => (
              <button
                key={v.id}
                data-reveal-item
                onClick={() => setVideo({ src: v.src, title: v.title })}
                className="group lift relative block aspect-video overflow-hidden rounded-2xl bg-ink shadow-pop-sm"
              >
                <Image
                  src={v.poster}
                  alt={v.title}
                  fill
                  sizes="(max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-[1.1s] group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-ink/25 transition-colors group-hover:bg-ink/35" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="inline-flex size-16 items-center justify-center rounded-full bg-gold text-ink shadow-gold transition-transform group-hover:scale-110">
                    <Play className="size-6 translate-x-0.5 fill-current" strokeWidth={0} />
                  </span>
                </span>
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink via-ink/55 to-transparent p-4 text-left">
                  <p className="font-display text-lg font-semibold tracking-tight text-[#f8f1e3]">{v.title}</p>
                </span>
              </button>
            ))}
          </ScrollReveal>
        )}

        {/* ── Reels grid (portrait) ───────────────────────────────────── */}
        {kind === "reels" && reels.length > 0 && (
          <ScrollReveal stagger key={`reels-${year}-${section}`} className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {reels.map((s) => (
              <button
                key={s.id}
                data-reveal-item
                onClick={() => setVideo({ src: s.src, title: s.title })}
                className="group lift relative block aspect-[9/16] overflow-hidden rounded-2xl bg-ink shadow-pop-sm"
              >
                <Image
                  src={s.poster}
                  alt={s.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-[1.1s] group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent" />
                <span className="absolute right-3 top-3 inline-flex size-10 items-center justify-center rounded-full bg-gold text-ink shadow-pop-sm">
                  <Play className="size-4 translate-x-px fill-current" strokeWidth={0} />
                </span>
                <span className="absolute inset-x-3 bottom-3 text-left">
                  <p className="line-clamp-2 text-sm font-medium text-[#f8f1e3]">{s.title}</p>
                </span>
              </button>
            ))}
          </ScrollReveal>
        )}
      </div>

      {/* Photo lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/92 p-6 backdrop-blur"
          onClick={() => setLightbox(null)}
        >
          <button
            aria-label="Close"
            onClick={() => setLightbox(null)}
            className="absolute right-6 top-6 inline-flex size-11 items-center justify-center rounded-full border border-[#f3ead9]/30 text-[#f3ead9] hover:bg-[#f3ead9]/10"
          >
            <X className="size-5" strokeWidth={1.75} />
          </button>
          <div className="relative aspect-[4/3] w-full max-w-5xl">
            <Image
              src={lightbox.src}
              alt={lightbox.alt}
              fill
              sizes="100vw"
              className="rounded-xl object-contain"
              priority
            />
          </div>
        </div>
      )}

      {/* Video lightbox */}
      {video && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/95 p-6 backdrop-blur"
          onClick={() => setVideo(null)}
        >
          <button
            aria-label="Close"
            onClick={() => setVideo(null)}
            className="absolute right-6 top-6 inline-flex size-11 items-center justify-center rounded-full border border-[#f3ead9]/30 text-[#f3ead9] hover:bg-[#f3ead9]/10"
          >
            <X className="size-5" strokeWidth={1.75} />
          </button>
          <div
            className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-xl border border-[#f3ead9]/15"
            onClick={(e) => e.stopPropagation()}
          >
            <video className="h-full w-full" src={video.src} autoPlay controls playsInline />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-4">
              <p className="font-display text-lg font-semibold tracking-tight text-[#f8f1e3]">{video.title}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
        active
          ? "bg-ink text-primary-foreground"
          : "border border-border bg-card text-muted-foreground hover:-translate-y-0.5 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function Chip({
  active,
  onClick,
  Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  Icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "border-gold bg-gold/12 text-gold-deep"
          : "border-border bg-card text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="size-3.5" strokeWidth={1.75} />
      {children}
    </button>
  );
}

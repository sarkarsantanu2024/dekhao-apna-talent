"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
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
import { Icon } from "@/components/common/icon";

type Kind = "photos" | "videos" | "reels";
type YearFilter = "All" | GalleryYear;
type SectionFilter = "All" | GalleryTag;

const KINDS: { id: Kind; label: string; icon: string }[] = [
  { id: "photos", label: "Photos", icon: "photo_camera" },
  { id: "videos", label: "Videos", icon: "movie" },
  { id: "reels", label: "Reels", icon: "smart_display" },
];

const SECTION_ICON: Record<GalleryTag, string> = {
  Finale: "emoji_events",
  Auditions: "groups",
  Dance: "music_note",
  Song: "mic",
  Math: "calculate",
  Other: "auto_awesome",
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
    <section className="bg-background py-14 sm:py-20">
      <div className="container mx-auto px-6">
        {/* ── Filter panel (full width) ───────────────────────────────── */}
        <div className="rounded-3xl border-2 border-border bg-card p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Year */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 font-fun text-sm font-semibold text-muted-foreground">Year</span>
              <Pill active={year === "All"} onClick={() => setYear("All")}>All</Pill>
              {GALLERY_YEARS.map((y) => (
                <Pill key={y} active={year === y} onClick={() => setYear(y)}>{y}</Pill>
              ))}
            </div>
            {/* Kind */}
            <div className="inline-flex self-start rounded-full border-2 border-border p-1">
              {KINDS.map((k) => (
                <button
                  key={k.id}
                  onClick={() => setKind(k.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-bold transition-colors ${
                    kind === k.id ? "bg-brand-gradient text-white" : "text-foreground/70 hover:text-foreground"
                  }`}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: 18, fontVariationSettings: "'FILL' 0" }}>{k.icon}</span>
                  {k.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sections */}
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t-2 border-border pt-4">
            <span className="mr-1 font-fun text-sm font-semibold text-muted-foreground">Section</span>
            <Chip active={section === "All"} onClick={() => setSection("All")} icon="grid_view">All</Chip>
            {GALLERY_SECTIONS.map((s) => (
              <Chip key={s} active={section === s} onClick={() => setSection(s)} icon={SECTION_ICON[s]}>{s}</Chip>
            ))}
          </div>
        </div>

        {/* count */}
        <p className="mt-5 font-fun text-sm text-muted-foreground">
          {current.length} {kind} {year !== "All" ? `from ${year}` : "from all editions"}
          {section !== "All" ? ` · ${section}` : ""}
        </p>

        {/* ── Empty state ─────────────────────────────────────────────── */}
        {current.length === 0 && (
          <div className="mt-10 rounded-3xl border-2 border-dashed border-border bg-card p-12 text-center">
            <span className="material-symbols-rounded text-crayon-grape" style={{ fontSize: 44 }}>sentiment_satisfied</span>
            <p className="mt-3 text-lg font-bold">Nothing here yet!</p>
            <p className="text-muted-foreground">Try another year or section — more moments coming soon.</p>
          </div>
        )}

        {/* ── Photos grid ─────────────────────────────────────────────── */}
        {kind === "photos" && photos.length > 0 && (
          <ScrollReveal stagger key={`photos-${year}-${section}`} className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((p) => (
              <button
                key={p.id}
                data-reveal-item
                onClick={() => setLightbox(p)}
                className="group lift relative block aspect-[4/3] overflow-hidden rounded-3xl border-4 border-card shadow-pop"
              >
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  sizes="(max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1 text-[11px] font-extrabold text-crayon-grape shadow-pop-sm backdrop-blur">
                  <span className="material-symbols-rounded" style={{ fontSize: 14, fontVariationSettings: "'FILL' 0" }}>{SECTION_ICON[p.tag]}</span>
                  {p.tag}
                </span>
                {p.year && (
                  <span className="absolute right-4 top-4 rounded-full bg-foreground/80 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
                    {p.year}
                  </span>
                )}
                <span className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-foreground via-foreground/70 to-transparent p-4 text-left text-sm font-medium text-white transition-transform duration-300 group-hover:translate-y-0">
                  {p.alt}
                </span>
              </button>
            ))}
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
                className="group lift relative block aspect-video overflow-hidden rounded-3xl border-4 border-card shadow-pop"
              >
                <Image
                  src={v.poster}
                  alt={v.title}
                  fill
                  sizes="(max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-foreground/20 transition-colors group-hover:bg-foreground/30" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="inline-flex size-16 items-center justify-center rounded-full bg-brand-gradient text-white shadow-pop transition-transform group-hover:scale-110">
                    <Icon name="play_arrow" size={30} filled />
                  </span>
                </span>
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground via-foreground/60 to-transparent p-4 text-left">
                  <p className="text-lg font-extrabold tracking-tight text-white">{v.title}</p>
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
                className="group lift relative block aspect-[9/16] overflow-hidden rounded-3xl border-4 border-card shadow-pop"
              >
                <Image
                  src={s.poster}
                  alt={s.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent" />
                <span className="absolute right-3 top-3 inline-flex size-10 items-center justify-center rounded-full bg-brand-gradient text-white shadow-pop-sm">
                  <Icon name="play_arrow" size={18} filled />
                </span>
                <span className="absolute inset-x-3 bottom-3 text-left">
                  <p className="line-clamp-2 text-sm font-bold text-white">{s.title}</p>
                </span>
              </button>
            ))}
          </ScrollReveal>
        )}
      </div>

      {/* Photo lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-foreground/90 p-6 backdrop-blur"
          onClick={() => setLightbox(null)}
        >
          <button
            aria-label="Close"
            onClick={() => setLightbox(null)}
            className="absolute right-6 top-6 inline-flex size-11 items-center justify-center rounded-full border-2 border-white/30 text-white hover:bg-white/10"
          >
            <Icon name="close" size={22} />
          </button>
          <div className="relative aspect-[4/3] w-full max-w-5xl">
            <Image
              src={lightbox.src}
              alt={lightbox.alt}
              fill
              sizes="100vw"
              className="rounded-2xl object-contain"
              priority
            />
          </div>
        </div>
      )}

      {/* Video lightbox */}
      {video && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-foreground/95 p-6 backdrop-blur"
          onClick={() => setVideo(null)}
        >
          <button
            aria-label="Close"
            onClick={() => setVideo(null)}
            className="absolute right-6 top-6 inline-flex size-11 items-center justify-center rounded-full border-2 border-white/30 text-white hover:bg-white/10"
          >
            <Icon name="close" size={22} />
          </button>
          <div
            className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-2xl border-4 border-white/15"
            onClick={(e) => e.stopPropagation()}
          >
            <video className="h-full w-full" src={video.src} autoPlay controls playsInline />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/80 to-transparent p-4">
              <p className="text-lg font-extrabold tracking-tight text-white">{video.title}</p>
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
      className={`rounded-full px-5 py-2 text-sm font-extrabold transition-all ${
        active
          ? "bg-brand-gradient text-white shadow-pop-sm"
          : "border-2 border-border bg-card text-foreground/70 hover:-translate-y-0.5 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function Chip({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border-2 px-4 py-1.5 text-sm font-bold transition-colors ${
        active
          ? "border-crayon-grape bg-crayon-grape/12 text-crayon-grape"
          : "border-border bg-card text-foreground/60 hover:text-foreground"
      }`}
    >
      <span className="material-symbols-rounded" style={{ fontSize: 16, fontVariationSettings: "'FILL' 0" }}>{icon}</span>
      {children}
    </button>
  );
}

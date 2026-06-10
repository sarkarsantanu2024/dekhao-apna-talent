"use client";

import Image from "next/image";
import { useState } from "react";
import {
  GALLERY_PHOTOS,
  GALLERY_VIDEOS,
  GALLERY_SHORTS,
  type GalleryPhoto,
} from "@/constants/media";
import { ScrollReveal } from "@/components/common/scroll-reveal";
import { Icon } from "@/components/common/icon";

type Tab = "photos" | "videos" | "shorts";

const TAGS = ["All", "Dance", "Song", "Math", "Finale"] as const;
type Tag = (typeof TAGS)[number];

export function GalleryView() {
  const [tab, setTab] = useState<Tab>("photos");
  const [tag, setTag] = useState<Tag>("All");
  const [lightbox, setLightbox] = useState<GalleryPhoto | null>(null);
  const [video, setVideo] = useState<{ src: string; title: string } | null>(null);

  const photos = tag === "All" ? GALLERY_PHOTOS : GALLERY_PHOTOS.filter((p) => p.tag === tag);

  return (
    <section className="border-t border-white/10 py-16 sm:py-20">
      <div className="container mx-auto px-6">
        {/* Tab switcher */}
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] p-1">
            {(["photos", "videos", "shorts"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`relative rounded-full px-5 py-2 text-[12px] font-bold uppercase tracking-wider transition-colors ${
                  tab === t ? "bg-[#A855F7] text-black" : "text-white/70 hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "photos" && (
            <div className="flex flex-wrap gap-2">
              {TAGS.map((tg) => (
                <button
                  key={tg}
                  onClick={() => setTag(tg)}
                  className={`rounded-full border px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                    tag === tg
                      ? "border-[#A855F7] bg-[#A855F7]/10 text-gradient"
                      : "border-white/15 text-white/60 hover:text-white"
                  }`}
                >
                  {tg}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Photos grid */}
        {tab === "photos" && (
          <ScrollReveal stagger key={`photos-${tag}`} className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((p) => (
              <button
                key={p.id}
                data-reveal-item
                onClick={() => setLightbox(p)}
                className="group relative block aspect-[4/3] overflow-hidden rounded-xl border border-white/10"
              >
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  sizes="(max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <span className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
                  {p.tag}
                </span>
                <span className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black via-black/70 to-transparent p-4 text-left text-sm text-white/90 transition-transform duration-300 group-hover:translate-y-0">
                  {p.alt}
                </span>
              </button>
            ))}
          </ScrollReveal>
        )}

        {/* Videos grid */}
        {tab === "videos" && (
          <ScrollReveal stagger key="videos" className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {GALLERY_VIDEOS.map((v) => (
              <button
                key={v.id}
                data-reveal-item
                onClick={() => setVideo({ src: v.src, title: v.title })}
                className="group relative block aspect-video overflow-hidden rounded-xl border border-white/10"
              >
                <Image
                  src={v.poster}
                  alt={v.title}
                  fill
                  sizes="(max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/50" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="inline-flex size-16 items-center justify-center rounded-full bg-[#A855F7] text-black shadow-2xl transition-transform group-hover:scale-110">
                    <Icon name="play_arrow" size={28} filled />
                  </span>
                </span>
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/60 to-transparent p-4 text-left">
                  <span className="text-[11px] uppercase tracking-wider text-gradient">Video</span>
                  <p className="mt-1 text-lg font-black uppercase tracking-tight text-white">{v.title}</p>
                </span>
              </button>
            ))}
          </ScrollReveal>
        )}

        {/* Shorts grid (portrait) */}
        {tab === "shorts" && (
          <ScrollReveal stagger key="shorts" className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {GALLERY_SHORTS.map((s) => (
              <button
                key={s.id}
                data-reveal-item
                onClick={() => setVideo({ src: s.src, title: s.title })}
                className="group relative block aspect-[9/16] overflow-hidden rounded-2xl border border-white/10"
              >
                <Image
                  src={s.poster}
                  alt={s.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent" />
                <span className="absolute right-3 top-3 inline-flex size-10 items-center justify-center rounded-full bg-[#A855F7] text-black opacity-0 transition-opacity group-hover:opacity-100">
                  <Icon name="play_arrow" size={18} filled />
                </span>
                <span className="absolute inset-x-3 bottom-3 text-left">
                  <span className="text-[10px] uppercase tracking-wider text-gradient">Reel</span>
                  <p className="mt-1 line-clamp-2 text-sm font-bold text-white">{s.title}</p>
                </span>
              </button>
            ))}
          </ScrollReveal>
        )}
      </div>

      {/* Photo lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-6 backdrop-blur"
          onClick={() => setLightbox(null)}
        >
          <button
            aria-label="Close"
            onClick={() => setLightbox(null)}
            className="absolute right-6 top-6 inline-flex size-11 items-center justify-center rounded-full border border-white/20 text-white hover:bg-white/10"
          >
            <Icon name="close" size={22} />
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
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-6 backdrop-blur"
          onClick={() => setVideo(null)}
        >
          <button
            aria-label="Close"
            onClick={() => setVideo(null)}
            className="absolute right-6 top-6 inline-flex size-11 items-center justify-center rounded-full border border-white/20 text-white hover:bg-white/10"
          >
            <Icon name="close" size={22} />
          </button>
          <div
            className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              className="h-full w-full"
              src={video.src}
              autoPlay
              controls
              playsInline
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <p className="text-lg font-black uppercase tracking-tight text-white">{video.title}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

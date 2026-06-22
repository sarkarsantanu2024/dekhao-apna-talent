"use client";

import Image from "next/image";
import { useState } from "react";
import { Swiper, SwiperSlide, useSwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination, Navigation, Keyboard } from "swiper/modules";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { HERO_MEDIA, type HeroSlide } from "@/constants/media";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

/**
 * Editorial media carousel for the hero. Renders a mix of slide kinds —
 * local/CDN video, photos, YouTube, Facebook, or any iframe embed — driven by
 * HERO_MEDIA. Fade transitions, gold pagination, autoplay (videos hold the
 * slide until done), and lazy iframes so only the active embed loads.
 */
export function HeroMedia() {
  const [prevEl, setPrevEl] = useState<HTMLElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLElement | null>(null);

  return (
    <div className="hero-swiper relative aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] border border-ink/10 bg-ink shadow-float sm:aspect-[4/3] lg:aspect-[5/6]">
      <Swiper
        modules={[Autoplay, EffectFade, Pagination, Navigation, Keyboard]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={800}
        loop
        autoplay={{ delay: 5500, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation={{ prevEl, nextEl }}
        keyboard={{ enabled: true }}
        className="h-full w-full"
      >
        {HERO_MEDIA.map((slide, i) => (
          <SwiperSlide key={i}>
            <Slide slide={slide} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* readability + frame */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-0 z-10 rounded-[1.75rem] ring-1 ring-inset ring-[#f3ead9]/15" />

      {/* arrows */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
        <button
          ref={setPrevEl}
          type="button"
          aria-label="Previous"
          className="grid size-9 place-items-center rounded-full bg-ink/55 text-[#f3ead9] backdrop-blur-md transition-colors hover:bg-gold hover:text-ink"
        >
          <ChevronLeft className="size-4" strokeWidth={2} />
        </button>
        <button
          ref={setNextEl}
          type="button"
          aria-label="Next"
          className="grid size-9 place-items-center rounded-full bg-ink/55 text-[#f3ead9] backdrop-blur-md transition-colors hover:bg-gold hover:text-ink"
        >
          <ChevronRight className="size-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

function Caption({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <span className="absolute bottom-4 left-4 z-20 inline-flex items-center gap-2 rounded-full bg-ink/65 px-3.5 py-1.5 text-xs font-medium text-[#f3ead9] backdrop-blur-md">
      <span className="size-1.5 animate-twinkle rounded-full bg-gold-soft" />
      {text}
    </span>
  );
}

function Slide({ slide }: { slide: HeroSlide }) {
  switch (slide.kind) {
    case "video":
      return <VideoSlide slide={slide} />;
    case "image":
      return (
        <div className="relative size-full">
          <Image src={slide.src} alt={slide.alt} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          <Caption text={slide.caption} />
        </div>
      );
    case "youtube":
      return <EmbedSlide src={`https://www.youtube-nocookie.com/embed/${slide.id}?rel=0&modestbranding=1`} caption={slide.caption} />;
    case "facebook":
      return (
        <EmbedSlide
          src={`https://www.facebook.com/plugins/video.php?show_text=false&href=${encodeURIComponent(slide.url)}`}
          caption={slide.caption}
        />
      );
    case "embed":
      return <EmbedSlide src={slide.url} caption={slide.caption} />;
  }
}

/** Local/CDN mp4 — plays only while its slide is active; holds the slide for
 *  its full length by overriding autoplay delay on this slide. */
function VideoSlide({ slide }: { slide: Extract<HeroSlide, { kind: "video" }> }) {
  const { isActive } = useSwiperSlide();
  return (
    <div className="relative size-full" data-swiper-autoplay="9000">
      <video
        className="size-full object-cover"
        autoPlay={isActive}
        loop
        muted
        playsInline
        preload="metadata"
        poster={slide.poster}
      >
        <source src={slide.src} type="video/mp4" />
      </video>
      <Caption text={slide.caption} />
    </div>
  );
}

/** YouTube / Facebook / generic iframe. Loads behind a poster button and only
 *  when the slide is active, so off-screen embeds never autoplay or fetch. */
function EmbedSlide({ src, caption }: { src: string; caption?: string }) {
  const { isActive } = useSwiperSlide();
  const [open, setOpen] = useState(false);

  if (open && isActive) {
    return (
      <div className="relative size-full bg-ink">
        <iframe
          src={src}
          title={caption ?? "Video"}
          className="size-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="group relative grid size-full place-items-center bg-[radial-gradient(circle_at_50%_40%,#2a2017,#140f0a)]"
    >
      <span className="grid size-16 place-items-center rounded-full bg-gold text-ink shadow-gold transition-transform group-hover:scale-110">
        <Play className="size-6 translate-x-0.5 fill-current" strokeWidth={0} />
      </span>
      <span className="eyebrow absolute bottom-16 text-[#f3ead9]/70">Tap to play</span>
      <Caption text={caption} />
    </button>
  );
}

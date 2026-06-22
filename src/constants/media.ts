/**
 * Centralised media URLs — ONE place to point the whole public site at your
 * real event photos & videos.
 *
 * Two modes:
 *   - USE_LOCAL_MEDIA = false → free CDN placeholders (topically-relevant
 *     LoremFlickr photos + Pexels videos). Works out of the box.
 *   - USE_LOCAL_MEDIA = true  → every image/video is read from `/public/images`
 *     using the exact filenames documented in `public/images/README.md`.
 *
 * To go live with real media: drop your files into `public/images/...`, then
 * set USE_LOCAL_MEDIA = true below and refresh. Nothing else to change.
 */

const USE_LOCAL_MEDIA = false;

/* ---------- helpers ---------- */
/** A file under /public/images (e.g. local("hero/hero.mp4") → /images/hero/hero.mp4). */
const local = (path: string) => `/images/${path}`;
/** Keyword-based placeholder (LoremFlickr) — returns a topically-relevant photo.
 *  `lock` keeps the same image stable for a given slot. */
const flick = (keyword: string, lock: number, w = 1200, h = 900) =>
  `https://loremflickr.com/${w}/${h}/${encodeURIComponent(keyword)}?lock=${lock}`;

/* ---------- hero ---------- */
export const HERO_VIDEO = USE_LOCAL_MEDIA
  ? {
      src: local("hero/hero.mp4"),
      poster: local("hero/hero-poster.jpg"),
    }
  : {
      src: "https://videos.pexels.com/video-files/3196284/3196284-uhd_2560_1440_25fps.mp4",
      poster:
        "https://images.pexels.com/photos/1916821/pexels-photo-1916821.jpeg?auto=compress&cs=tinysrgb&w=1920",
    };

/* ---------- judges (used on home + about pages) ---------- */
/* Drop real headshots at public/images/judges/<file>. These are always local. */
export const JUDGES = [
  {
    name: "Indrani Sen",
    role: "Playback Singer",
    bio: "Celebrated Bengali playback singer, gracing the panel as a special judge.",
    src: local("judges/indrani-sen.jpeg"),
    width: 750,
    height: 1060,
  },
  {
    name: "Sonamoni Saha",
    role: "TV Actress",
    bio: "Popular Bengali television actress, joining the finale as a special judge.",
    src: local("judges/sonamoni-saha.jpg"),
    width: 720,
    height: 1280,
  },
];

/* ════════════════════════════════════════════════════════════════════════
   GALLERY — year-wise + section-wise archive
   Filter dimensions used by /gallery: YEAR (2024/25/26) × SECTION
   (Finale · Auditions · Dance · Song · Math · Other) and media kind
   (photos · videos · reels).

   Local filenames live under public/images/gallery/<year>/… — see the
   README for the full list.
   ════════════════════════════════════════════════════════════════════════ */

export const GALLERY_YEARS = [2026, 2025, 2024] as const;
export type GalleryYear = (typeof GALLERY_YEARS)[number];

/** Section/category tags shared by photos and videos. */
export const GALLERY_SECTIONS = [
  "Finale",
  "Auditions",
  "Dance",
  "Song",
  "Math",
  "Other",
] as const;
export type GalleryTag = (typeof GALLERY_SECTIONS)[number];

export type GalleryPhoto = {
  id: string;
  src: string;
  alt: string;
  tag: GalleryTag;
  /** Optional — set on /gallery items; omitted on curated home previews. */
  year?: GalleryYear;
};
export type GalleryVideo = {
  id: string;
  src: string;
  poster: string;
  title: string;
  tag?: GalleryTag;
  year?: GalleryYear;
};
export type GalleryShort = GalleryVideo;

/* Search keywords per section so placeholder photos are topically relevant. */
const SECTION_KEYWORD: Record<GalleryTag, string> = {
  Finale: "concert",
  Auditions: "performance",
  Dance: "dance",
  Song: "singing",
  Math: "mathematics",
  Other: "children",
};

/* What kinds of shot each section shows in the archive. `file` is the local
   filename stem under public/images/gallery/<year>/ (e.g. "finale-1"). */
const RAW_SPECS: { tag: GalleryTag; alt: string }[] = [
  { tag: "Finale", alt: "National stage finale lights" },
  { tag: "Finale", alt: "Award ceremony moment" },
  { tag: "Auditions", alt: "District audition round" },
  { tag: "Auditions", alt: "Backstage warm-up" },
  { tag: "Dance", alt: "Classical dance performance" },
  { tag: "Dance", alt: "Group dance set" },
  { tag: "Song", alt: "Solo song performance" },
  { tag: "Song", alt: "Choir on stage" },
  { tag: "Math", alt: "Mental Math Olympiad round" },
  { tag: "Other", alt: "Special talent act" },
];
const _tagCount: Partial<Record<GalleryTag, number>> = {};
const PHOTO_SPECS = RAW_SPECS.map((s) => {
  const n = (_tagCount[s.tag] = (_tagCount[s.tag] ?? 0) + 1);
  return { ...s, file: `${s.tag.toLowerCase()}-${n}` };
});

/** Full archive: every year × every section spec. */
export const GALLERY_PHOTOS: GalleryPhoto[] = GALLERY_YEARS.flatMap((year, yi) =>
  PHOTO_SPECS.map((spec, i) => ({
    id: `p-${year}-${i}`,
    src: USE_LOCAL_MEDIA
      ? local(`gallery/${year}/${spec.file}.jpg`)
      : flick(SECTION_KEYWORD[spec.tag], yi * 100 + i),
    alt: `${spec.alt} · ${year}`,
    tag: spec.tag,
    year,
  })),
);

/* Reusable placeholder clips (used only when USE_LOCAL_MEDIA = false). */
const HVIDEOS = [
  "https://videos.pexels.com/video-files/4761711/4761711-hd_1920_1080_24fps.mp4",
  "https://videos.pexels.com/video-files/8419050/8419050-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/3196284/3196284-hd_1920_1080_25fps.mp4",
];
const VVIDEOS = [
  "https://videos.pexels.com/video-files/5495840/5495840-hd_1080_1920_30fps.mp4",
  "https://videos.pexels.com/video-files/6963744/6963744-hd_1080_1920_30fps.mp4",
  "https://videos.pexels.com/video-files/8419076/8419076-hd_1080_1920_30fps.mp4",
  "https://videos.pexels.com/video-files/5752729/5752729-hd_1080_1920_30fps.mp4",
];

/** Full-length videos — a finale recap + an auditions recap per year. */
export const GALLERY_VIDEOS: GalleryVideo[] = GALLERY_YEARS.flatMap((year, yi) => [
  {
    id: `v-${year}-finale`,
    src: USE_LOCAL_MEDIA ? local(`gallery/${year}/video-finale.mp4`) : HVIDEOS[yi % HVIDEOS.length],
    poster: USE_LOCAL_MEDIA ? local(`gallery/${year}/video-finale.jpg`) : flick("concert", 900 + yi, 1280, 720),
    title: `${year} Finale highlights`,
    tag: "Finale",
    year,
  },
  {
    id: `v-${year}-aud`,
    src: USE_LOCAL_MEDIA ? local(`gallery/${year}/video-auditions.mp4`) : HVIDEOS[(yi + 1) % HVIDEOS.length],
    poster: USE_LOCAL_MEDIA ? local(`gallery/${year}/video-auditions.jpg`) : flick("performance", 910 + yi, 1280, 720),
    title: `${year} District auditions recap`,
    tag: "Auditions",
    year,
  },
]);

/** Short vertical reels — a couple of fun clips per year. */
export const GALLERY_SHORTS: GalleryShort[] = GALLERY_YEARS.flatMap((year, yi) => [
  {
    id: `s-${year}-1`,
    src: USE_LOCAL_MEDIA ? local(`gallery/${year}/reel-1.mp4`) : VVIDEOS[(yi * 2) % VVIDEOS.length],
    poster: USE_LOCAL_MEDIA ? local(`gallery/${year}/reel-1.jpg`) : flick("performance", 920 + yi, 540, 960),
    title: `${year} Backstage smiles`,
    tag: "Auditions",
    year,
  },
  {
    id: `s-${year}-2`,
    src: USE_LOCAL_MEDIA ? local(`gallery/${year}/reel-2.mp4`) : VVIDEOS[(yi * 2 + 1) % VVIDEOS.length],
    poster: USE_LOCAL_MEDIA ? local(`gallery/${year}/reel-2.jpg`) : flick("dance", 930 + yi, 540, 960),
    title: `${year} Stage walk-on`,
    tag: "Finale",
    year,
  },
]);

/* ---------- latest moments (homepage preview) ---------- */
/** Curated shots on the home page's "Latest moments" strip. Local files live at
 *  public/images/home/latest-1.jpg … latest-6.jpg. */
const LATEST_META: { keyword: string; alt: string; tag: GalleryTag }[] = [
  { keyword: "concert", alt: "Spotlights on the national stage", tag: "Finale" },
  { keyword: "dance", alt: "Dance audition in motion", tag: "Dance" },
  { keyword: "singing", alt: "Solo song performance", tag: "Song" },
  { keyword: "concert", alt: "Crowd cheering at the finale", tag: "Finale" },
  { keyword: "mathematics", alt: "Mental math round in progress", tag: "Math" },
  { keyword: "dance", alt: "Group dance set", tag: "Dance" },
];
export const LATEST_MOMENTS: GalleryPhoto[] = LATEST_META.map((m, i) => ({
  id: `lm${i + 1}`,
  src: USE_LOCAL_MEDIA ? local(`home/latest-${i + 1}.jpg`) : flick(m.keyword, i + 1),
  alt: m.alt,
  tag: m.tag,
}));

/* ---------- category backdrops (Pick your stage) ---------- */
/** Local files: public/images/categories/<slug>.jpg */
export const CATEGORY_IMAGES: Record<string, string> = USE_LOCAL_MEDIA
  ? {
      dance: local("categories/dance.jpg"),
      song: local("categories/song.jpg"),
      "mental-math": local("categories/mental-math.jpg"),
      "other-talent": local("categories/other-talent.jpg"),
    }
  : {
      dance: flick("dance", 11),
      song: flick("singing", 12),
      "mental-math": flick("mathematics", 13),
      "other-talent": flick("children", 14),
    };

export const PAST_EVENT_TICKER = [
  "2024 · Finale Kolkata",
  "200+ centres",
  "Ages 6–14",
  "Star judges",
  "₹5,000 top prize",
  "Dance · Song · Math · Talent",
  "National stage",
];

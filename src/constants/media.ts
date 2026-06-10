/**
 * Centralised media URLs.
 *
 * Two modes:
 *   - USE_LOCAL_MEDIA = false → free CDN media (Pexels videos, Picsum photos).
 *     Works out of the box, nothing to download.
 *   - USE_LOCAL_MEDIA = true  → files live under /public/media (see
 *     public/media/README.md for the expected filenames). Drop your event
 *     footage in those folders, flip the flag, refresh.
 *
 * Mixing is allowed — if you only have, say, the hero video, set the flag
 * to false and replace just the HERO_VIDEO entry's `src`.
 */

const USE_LOCAL_MEDIA = false;

/* ---------- helpers ---------- */
const local = (path: string) => `/media/${path}`;
const pic = (seed: string, w = 1200, h = 900) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;
/** Pexels CDN — photo IDs come from pexels.com/photo/<id> URLs. Swap easily. */
const pex = (id: string | number, w = 1280) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

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
/* Real photos live in /public/media/judges, so these are always local
   regardless of USE_LOCAL_MEDIA. */
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

/* ---------- gallery ---------- */
export type GalleryPhoto = {
  id: string;
  src: string;
  alt: string;
  tag: "Dance" | "Song" | "Math" | "Finale";
};
export type GalleryVideo = {
  id: string;
  src: string;
  poster: string;
  title: string;
};
export type GalleryShort = {
  id: string;
  src: string;
  poster: string;
  title: string;
};

export const GALLERY_PHOTOS: GalleryPhoto[] = USE_LOCAL_MEDIA
  ? [
      {
        id: "p1",
        src: local("gallery/photos/dance-1.jpg"),
        alt: "District audition dance",
        tag: "Dance",
      },
      {
        id: "p2",
        src: local("gallery/photos/song-1.jpg"),
        alt: "Solo song performance",
        tag: "Song",
      },
      {
        id: "p3",
        src: local("gallery/photos/math-1.jpg"),
        alt: "Mental math olympiad round",
        tag: "Math",
      },
      {
        id: "p4",
        src: local("gallery/photos/finale-1.jpg"),
        alt: "National stage finale lights",
        tag: "Finale",
      },
      {
        id: "p5",
        src: local("gallery/photos/dance-2.jpg"),
        alt: "Group dance",
        tag: "Dance",
      },
      {
        id: "p6",
        src: local("gallery/photos/song-2.jpg"),
        alt: "Choir performance",
        tag: "Song",
      },
      {
        id: "p7",
        src: local("gallery/photos/finale-2.jpg"),
        alt: "Award ceremony",
        tag: "Finale",
      },
      {
        id: "p8",
        src: local("gallery/photos/math-2.jpg"),
        alt: "Abacus level round",
        tag: "Math",
      },
      {
        id: "p9",
        src: local("gallery/photos/dance-3.jpg"),
        alt: "Classical dance",
        tag: "Dance",
      },
    ]
  : [
      {
        id: "p1",
        src: pic("dat-dance-1"),
        alt: "District audition dance",
        tag: "Dance",
      },
      {
        id: "p2",
        src: pic("dat-song-1"),
        alt: "Solo song performance",
        tag: "Song",
      },
      {
        id: "p3",
        src: pic("dat-math-1"),
        alt: "Mental math olympiad round",
        tag: "Math",
      },
      {
        id: "p4",
        src: pic("dat-finale-1"),
        alt: "National stage finale lights",
        tag: "Finale",
      },
      { id: "p5", src: pic("dat-dance-2"), alt: "Group dance", tag: "Dance" },
      {
        id: "p6",
        src: pic("dat-song-2"),
        alt: "Choir performance",
        tag: "Song",
      },
      {
        id: "p7",
        src: pic("dat-finale-2"),
        alt: "Award ceremony",
        tag: "Finale",
      },
      {
        id: "p8",
        src: pic("dat-math-2"),
        alt: "Abacus level round",
        tag: "Math",
      },
      {
        id: "p9",
        src: pic("dat-dance-3"),
        alt: "Classical dance",
        tag: "Dance",
      },
    ];

export const GALLERY_VIDEOS: GalleryVideo[] = USE_LOCAL_MEDIA
  ? [
      {
        id: "v1",
        src: local("gallery/videos/highlights-1.mp4"),
        poster: local("gallery/photos/finale-1.jpg"),
        title: "Finale highlights",
      },
      {
        id: "v2",
        src: local("gallery/videos/highlights-2.mp4"),
        poster: local("gallery/photos/dance-1.jpg"),
        title: "District auditions recap",
      },
      {
        id: "v3",
        src: local("gallery/videos/highlights-3.mp4"),
        poster: local("gallery/photos/song-1.jpg"),
        title: "Behind the scenes",
      },
    ]
  : [
      {
        id: "v1",
        src: "https://videos.pexels.com/video-files/4761711/4761711-hd_1920_1080_24fps.mp4",
        poster: pic("dat-video-1", 1280, 720),
        title: "Finale 2024 highlights",
      },
      {
        id: "v2",
        src: "https://videos.pexels.com/video-files/8419050/8419050-hd_1920_1080_25fps.mp4",
        poster: pic("dat-video-2", 1280, 720),
        title: "District auditions recap",
      },
      {
        id: "v3",
        src: "https://videos.pexels.com/video-files/3196284/3196284-hd_1920_1080_25fps.mp4",
        poster: pic("dat-video-3", 1280, 720),
        title: "Behind the scenes",
      },
    ];

export const GALLERY_SHORTS: GalleryShort[] = USE_LOCAL_MEDIA
  ? [
      {
        id: "s1",
        src: local("gallery/shorts/short-1.mp4"),
        poster: local("gallery/photos/dance-2.jpg"),
        title: "Backstage smiles",
      },
      {
        id: "s2",
        src: local("gallery/shorts/short-2.mp4"),
        poster: local("gallery/photos/finale-2.jpg"),
        title: "Stage walk-on",
      },
      {
        id: "s3",
        src: local("gallery/shorts/short-3.mp4"),
        poster: local("gallery/photos/song-2.jpg"),
        title: "Judges reactions",
      },
      {
        id: "s4",
        src: local("gallery/shorts/short-4.mp4"),
        poster: local("gallery/photos/dance-3.jpg"),
        title: "Crowd cheers",
      },
    ]
  : [
      {
        id: "s1",
        src: "https://videos.pexels.com/video-files/5495840/5495840-hd_1080_1920_30fps.mp4",
        poster: pic("dat-short-1", 540, 960),
        title: "Backstage smiles",
      },
      {
        id: "s2",
        src: "https://videos.pexels.com/video-files/6963744/6963744-hd_1080_1920_30fps.mp4",
        poster: pic("dat-short-2", 540, 960),
        title: "Stage walk-on",
      },
      {
        id: "s3",
        src: "https://videos.pexels.com/video-files/8419076/8419076-hd_1080_1920_30fps.mp4",
        poster: pic("dat-short-3", 540, 960),
        title: "Judges reactions",
      },
      {
        id: "s4",
        src: "https://videos.pexels.com/video-files/5752729/5752729-hd_1080_1920_30fps.mp4",
        poster: pic("dat-short-4", 540, 960),
        title: "Crowd cheers",
      },
    ];

/* ---------- latest moments (homepage preview) ---------- */
/**
 * Curated, themed shots used on the home page's "Latest moments" preview.
 * /gallery (which shows the full past archive) uses GALLERY_PHOTOS instead.
 * Photo IDs are Pexels — swap any by changing the ID number.
 */
export const LATEST_MOMENTS: GalleryPhoto[] = USE_LOCAL_MEDIA
  ? [
      {
        id: "lm1",
        src: local("gallery/photos/finale-1.jpg"),
        alt: "Spotlights on the national stage",
        tag: "Finale",
      },
      {
        id: "lm2",
        src: local("gallery/photos/dance-1.jpg"),
        alt: "Dance audition in motion",
        tag: "Dance",
      },
      {
        id: "lm3",
        src: local("gallery/photos/song-1.jpg"),
        alt: "Solo song performance",
        tag: "Song",
      },
      {
        id: "lm4",
        src: local("gallery/photos/finale-2.jpg"),
        alt: "Crowd cheering at the finale",
        tag: "Finale",
      },
      {
        id: "lm5",
        src: local("gallery/photos/math-1.jpg"),
        alt: "Mental math round in progress",
        tag: "Math",
      },
      {
        id: "lm6",
        src: local("gallery/photos/dance-2.jpg"),
        alt: "Group dance set",
        tag: "Dance",
      },
    ]
  : [
      {
        id: "lm1",
        src: pex(1916821),
        alt: "Spotlights on the national stage",
        tag: "Finale",
      },
      {
        id: "lm2",
        src: pex(2102568),
        alt: "Dance audition in motion",
        tag: "Dance",
      },
      {
        id: "lm3",
        src: pex(1671325),
        alt: "Solo song performance",
        tag: "Song",
      },
      {
        id: "lm4",
        src: pex(196659),
        alt: "Crowd cheering at the finale",
        tag: "Finale",
      },
      {
        id: "lm5",
        src: pex(6256009),
        alt: "Mental math round in progress",
        tag: "Math",
      },
      { id: "lm6", src: pex(1190297), alt: "Group dance set", tag: "Dance" },
    ];

/* ---------- category backdrops (Pick your stage) ---------- */
export const CATEGORY_IMAGES: Record<string, string> = USE_LOCAL_MEDIA
  ? {
      dance: local("gallery/photos/dance-1.jpg"),
      song: local("gallery/photos/song-1.jpg"),
      "mental-math": local("gallery/photos/math-1.jpg"),
      "other-talent": local("gallery/photos/finale-1.jpg"),
    }
  : {
      dance: pex(2102568),
      song: pex(1671325),
      "mental-math": pex(6256009),
      "other-talent": pex(167636),
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

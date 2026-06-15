# Event images & videos

Every photo and video on the public site is driven from here. Drop your real
event media into the folders below using the **exact filenames**, then open
[`src/constants/media.ts`](../../src/constants/media.ts) and set:

```ts
const USE_LOCAL_MEDIA = true;
```

Refresh — the hero, judges, categories, "Latest moments" and the whole
year-wise gallery now read from `/public/images/` instead of the free CDN
placeholders. (Judge photos are always read from here regardless of the flag.)

Recommended: JPGs ~1600px on the long edge for photos; MP4 (H.264) for video.

```
public/images/
├── hero/
│   ├── hero.mp4              ← homepage hero background video (silent, loops, ~10–20s)
│   └── hero-poster.jpg       ← still frame shown before the video loads
│
├── judges/                   ← always used (not behind the flag)
│   ├── indrani-sen.jpeg
│   └── sonamoni-saha.jpg
│
├── categories/               ← backdrop per category card
│   ├── dance.jpg
│   ├── song.jpg
│   ├── mental-math.jpg
│   └── other-talent.jpg
│
├── home/                     ← "Latest moments" strip on the homepage
│   ├── latest-1.jpg   (finale)
│   ├── latest-2.jpg   (dance)
│   ├── latest-3.jpg   (song)
│   ├── latest-4.jpg   (finale)
│   ├── latest-5.jpg   (math)
│   └── latest-6.jpg   (dance)
│
└── gallery/                  ← the /gallery archive, one folder per year
    ├── 2026/
    │   ├── finale-1.jpg          finale-2.jpg
    │   ├── auditions-1.jpg       auditions-2.jpg
    │   ├── dance-1.jpg           dance-2.jpg
    │   ├── song-1.jpg            song-2.jpg
    │   ├── math-1.jpg
    │   ├── other-1.jpg
    │   ├── video-finale.mp4      video-finale.jpg      (poster)
    │   ├── video-auditions.mp4   video-auditions.jpg   (poster)
    │   ├── reel-1.mp4            reel-1.jpg            (portrait 9:16 + poster)
    │   └── reel-2.mp4            reel-2.jpg
    ├── 2025/   ← same filenames as 2026/
    └── 2024/   ← same filenames as 2026/
```

Notes
- Photos are tagged by their filename stem (`finale-*`, `auditions-*`,
  `dance-*`, `song-*`, `math-*`, `other-*`) and filtered by year + section on
  the gallery page.
- To add/remove slots or extra years, edit `GALLERY_YEARS` / `RAW_SPECS` in
  [`src/constants/media.ts`](../../src/constants/media.ts) — the filenames here
  follow those definitions automatically.
- Reels are vertical (9:16); videos are landscape (16:9).

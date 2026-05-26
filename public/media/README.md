# Local media

This folder is the home for every image and video the public site renders.

**Two-step switch to your own media:**

1. Drop your files into the subfolders below using the exact filenames listed.
2. Open [`src/constants/media.ts`](../../src/constants/media.ts) and set:
   ```ts
   const USE_LOCAL_MEDIA = true;
   ```
   That's it — every consumer (hero, judges, gallery, latest moments, category
   backdrops) instantly reads from `/public/media/` instead of the free CDN
   placeholders.

Until you flip the flag, the site keeps rendering with curated Pexels + Picsum
images so nothing looks empty during development.

```
public/media/
├── hero/
│   ├── hero.mp4              ← homepage hero background video (silent, loop, ~10–20s)
│   └── hero-poster.jpg       ← still frame shown before video loads
├── gallery/
│   ├── photos/
│   │   ├── dance-1.jpg       ← also reused as a Latest Moments tile
│   │   ├── dance-2.jpg       ← also reused as a Latest Moments tile
│   │   ├── dance-3.jpg
│   │   ├── song-1.jpg        ← also Latest Moments + Song category backdrop
│   │   ├── song-2.jpg
│   │   ├── math-1.jpg        ← also Latest Moments + Math category backdrop
│   │   ├── math-2.jpg
│   │   ├── finale-1.jpg      ← also Latest Moments + Other-Talent backdrop
│   │   └── finale-2.jpg      ← also Latest Moments
│   ├── videos/               ← landscape highlights (16:9)
│   │   ├── highlights-1.mp4
│   │   ├── highlights-2.mp4
│   │   └── highlights-3.mp4
│   └── shorts/               ← portrait reels (9:16)
│       ├── short-1.mp4
│       ├── short-2.mp4
│       ├── short-3.mp4
│       └── short-4.mp4
└── judges/
    ├── indrani.jpg
    └── sonamoni.jpg
```

## Want a custom layout?

If you'd rather name your files differently, just edit the corresponding
`local("…")` paths in `src/constants/media.ts` — no other file references the
filenames directly. You can also mix-and-match: keep `USE_LOCAL_MEDIA = false`
and override just `HERO_VIDEO.src` with a string pointing at `/media/hero/your-clip.mp4`.

## Recommended specs

| File                     | Format       | Size                          |
|--------------------------|--------------|-------------------------------|
| `hero/hero.mp4`          | H.264 MP4    | 1080p or 1440p · ≤ 8 MB ideal |
| `hero/hero-poster.jpg`   | JPG          | 1920×1080                     |
| `gallery/photos/*.jpg`   | JPG          | 1600×1200 max                 |
| `gallery/videos/*.mp4`   | H.264 MP4    | 1920×1080, ≤ 15 MB            |
| `gallery/shorts/*.mp4`   | H.264 MP4    | 1080×1920 (portrait)          |
| `judges/*.jpg`           | JPG          | 800×1100                      |

Videos should be muted-autoplay friendly (no audio track required).

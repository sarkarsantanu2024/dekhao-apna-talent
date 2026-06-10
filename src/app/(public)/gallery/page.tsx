import { PageHero } from "@/components/common/page-hero";
import { GalleryView } from "./gallery-view";

export const metadata = { title: "Gallery — Past Events" };

export default function GalleryPage() {
  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title={<>Moments from <span className="text-gradient">past editions.</span></>}
        subtitle="Photos, full-length videos and short reels from district auditions and national-stage finales."
      />
      <GalleryView />
    </>
  );
}

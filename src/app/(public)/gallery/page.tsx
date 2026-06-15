import { PageHero } from "@/components/common/page-hero";
import { GalleryView } from "./gallery-view";

export const metadata = { title: "Gallery — Past Events" };

export default function GalleryPage() {
  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title={<>Moments full of <span className="text-gradient">smiles & sparkle!</span></>}
        subtitle="Browse photos, videos and reels by year — from district auditions to the big national-stage finale."
      />
      <GalleryView />
    </>
  );
}

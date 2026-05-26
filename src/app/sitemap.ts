import type { MetadataRoute } from "next";
import { SITE_URL } from "@/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ["", "/about", "/categories", "/rules", "/prizes", "/contact", "/login", "/register"].map((p) => ({
    url: `${SITE_URL}${p}`, lastModified: now, changeFrequency: "weekly", priority: p === "" ? 1 : 0.7,
  }));
}

import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://barbooktx.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE_URL, lastModified: new Date("2026-03-20") },
    { url: `${BASE_URL}/directory`, lastModified: new Date("2026-03-20") },
    { url: `${BASE_URL}/violations`, lastModified: new Date("2026-03-20") },
    { url: `${BASE_URL}/new-applications`, lastModified: new Date("2026-03-20") },
    { url: `${BASE_URL}/top-revenue`, lastModified: new Date("2026-03-20") },
    { url: `${BASE_URL}/pricing`, lastModified: new Date("2026-03-15") },
    { url: `${BASE_URL}/about`, lastModified: new Date("2026-03-20") },
    { url: `${BASE_URL}/privacy`, lastModified: new Date("2026-03-20") },
    { url: `${BASE_URL}/terms`, lastModified: new Date("2026-03-20") },
  ];
}

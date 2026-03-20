import { db } from "@/db";
import { licenses } from "@/db/schema";
import { sql, count } from "drizzle-orm";
import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://barbooktx.com";
const URLS_PER_SITEMAP = 10000;

export async function generateSitemaps(): Promise<Array<{ id: number }>> {
  const [[licenseCount], [cityCount], [countyCount], [zipCount]] = await Promise.all([
    db.select({ count: count() }).from(licenses),
    db.select({ count: sql<number>`count(distinct ${licenses.city})` }).from(licenses)
      .where(sql`${licenses.city} is not null AND ${licenses.city} != ''`),
    db.select({ count: sql<number>`count(distinct ${licenses.county})` }).from(licenses)
      .where(sql`${licenses.county} is not null AND ${licenses.county} != ''`),
    db.select({ count: sql<number>`count(distinct ${licenses.zip})` }).from(licenses)
      .where(sql`${licenses.zip} is not null AND ${licenses.zip} != ''`),
  ]);

  const totalUrls =
    6 + // static pages
    (licenseCount?.count ?? 0) +
    (cityCount?.count ?? 0) +
    (countyCount?.count ?? 0) +
    (zipCount?.count ?? 0);

  const numSitemaps = Math.ceil(totalUrls / URLS_PER_SITEMAP);

  return Array.from({ length: Math.max(numSitemaps, 1) }, (_, i) => ({ id: i }));
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const offset = id * URLS_PER_SITEMAP;

  // Build all URLs in order: static, licenses, cities, counties, zips
  // We need to figure out which segment this chunk falls into

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/directory`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/violations`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/new-applications`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/top-revenue`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  ];

  // For the first chunk, include static pages
  // Then paginate through licenses using SQL LIMIT/OFFSET
  if (id === 0) {
    const licenseBatch = await db
      .select({ slug: licenses.slug, updatedAt: licenses.updatedAt })
      .from(licenses)
      .orderBy(licenses.slug)
      .limit(URLS_PER_SITEMAP - staticPages.length)
      .offset(0);

    return [
      ...staticPages,
      ...licenseBatch.map((l) => ({
        url: `${BASE_URL}/licenses/${l.slug}`,
        lastModified: l.updatedAt ?? new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ];
  }

  // For subsequent chunks, we need to know where licenses end and geo pages begin
  const [licenseCountResult] = await db
    .select({ count: count() })
    .from(licenses);
  const totalLicenses = licenseCountResult?.count ?? 0;

  // Adjusted offset accounting for static pages in chunk 0
  const globalOffset = offset;

  // Are we still in the license range?
  const licenseGlobalEnd = staticPages.length + totalLicenses;

  if (globalOffset < licenseGlobalEnd) {
    // This chunk is still within licenses
    const licenseOffset = globalOffset - staticPages.length;
    const licenseBatch = await db
      .select({ slug: licenses.slug, updatedAt: licenses.updatedAt })
      .from(licenses)
      .orderBy(licenses.slug)
      .limit(URLS_PER_SITEMAP)
      .offset(licenseOffset);

    return licenseBatch.map((l) => ({
      url: `${BASE_URL}/licenses/${l.slug}`,
      lastModified: l.updatedAt ?? new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  }

  // Past licenses — load all geo pages (cities, counties, zips are small)
  const [cities, counties, zips] = await Promise.all([
    db
      .select({ city: licenses.city })
      .from(licenses)
      .where(sql`${licenses.city} is not null AND ${licenses.city} != ''`)
      .groupBy(licenses.city),
    db
      .select({ county: licenses.county })
      .from(licenses)
      .where(sql`${licenses.county} is not null AND ${licenses.county} != ''`)
      .groupBy(licenses.county),
    db
      .select({ zip: licenses.zip })
      .from(licenses)
      .where(sql`${licenses.zip} is not null AND ${licenses.zip} != ''`)
      .groupBy(licenses.zip),
  ]);

  const geoPages: MetadataRoute.Sitemap = [
    ...cities
      .filter((c) => c.city)
      .map((c) => ({
        url: `${BASE_URL}/cities/${encodeURIComponent(c.city!.toLowerCase())}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ...counties
      .filter((c) => c.county)
      .map((c) => ({
        url: `${BASE_URL}/counties/${encodeURIComponent(c.county!.toLowerCase())}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ...zips
      .filter((z) => z.zip)
      .map((z) => ({
        url: `${BASE_URL}/zip/${z.zip}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
  ];

  // Calculate offset within geo pages
  const geoOffset = globalOffset - licenseGlobalEnd;
  return geoPages.slice(geoOffset, geoOffset + URLS_PER_SITEMAP);
}

import { db } from "@/db";
import { licenses } from "@/db/schema";
import { sql } from "drizzle-orm";
import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://liquorscope.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const allLicenses = await db
    .select({ slug: licenses.slug, updatedAt: licenses.updatedAt })
    .from(licenses);

  const cities = await db
    .select({ city: licenses.city })
    .from(licenses)
    .where(sql`${licenses.city} is not null AND ${licenses.city} != ''`)
    .groupBy(licenses.city);

  const counties = await db
    .select({ county: licenses.county })
    .from(licenses)
    .where(sql`${licenses.county} is not null AND ${licenses.county} != ''`)
    .groupBy(licenses.county);

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/directory`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/violations`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/new-applications`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/top-revenue`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  ];

  const licensePages: MetadataRoute.Sitemap = allLicenses.map((l) => ({
    url: `${BASE_URL}/licenses/${l.slug}`,
    lastModified: l.updatedAt ?? new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const cityPages: MetadataRoute.Sitemap = cities
    .filter((c) => c.city)
    .map((c) => ({
      url: `${BASE_URL}/cities/${encodeURIComponent(c.city!.toLowerCase())}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  const countyPages: MetadataRoute.Sitemap = counties
    .filter((c) => c.county)
    .map((c) => ({
      url: `${BASE_URL}/counties/${encodeURIComponent(c.county!.toLowerCase())}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  return [...staticPages, ...licensePages, ...cityPages, ...countyPages];
}

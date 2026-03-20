import { db } from "@/db";
import { licenses } from "@/db/schema";
import { sql } from "drizzle-orm";
import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://barbooktx.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const cities = await db
      .select({
        city: licenses.city,
        lastUpdated: sql<Date>`MAX(${licenses.updatedAt})`,
        cnt: sql<number>`COUNT(*)`,
      })
      .from(licenses)
      .where(sql`${licenses.city} is not null AND ${licenses.city} != ''`)
      .groupBy(licenses.city)
      .having(sql`COUNT(*) >= 3`);

    return cities
      .filter((c) => c.city)
      .map((c) => ({
        url: `${BASE_URL}/cities/${encodeURIComponent(c.city!.toLowerCase())}`,
        lastModified: c.lastUpdated ?? new Date(),
      }));
  } catch (e) {
    console.error("[sitemap:cities] Failed to generate sitemap:", e);
    return [];
  }
}

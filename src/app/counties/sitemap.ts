import { db } from "@/db";
import { licenses } from "@/db/schema";
import { sql } from "drizzle-orm";
import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://barbooktx.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const counties = await db
      .select({
        county: licenses.county,
        lastUpdated: sql<Date>`MAX(${licenses.updatedAt})`,
        cnt: sql<number>`COUNT(*)`,
      })
      .from(licenses)
      .where(sql`${licenses.county} is not null AND ${licenses.county} != ''`)
      .groupBy(licenses.county)
      .having(sql`COUNT(*) >= 3`);

    return counties
      .filter((c) => c.county)
      .map((c) => ({
        url: `${BASE_URL}/counties/${encodeURIComponent(c.county!.toLowerCase())}`,
        lastModified: c.lastUpdated ?? new Date(),
      }));
  } catch (e) {
    console.error("[sitemap:counties] Failed to generate sitemap:", e);
    return [];
  }
}

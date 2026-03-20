import { db } from "@/db";
import { licenses } from "@/db/schema";
import { sql } from "drizzle-orm";
import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://barbooktx.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const zips = await db
      .select({
        zip: licenses.zip,
        lastUpdated: sql<Date>`MAX(${licenses.updatedAt})`,
        cnt: sql<number>`COUNT(*)`,
      })
      .from(licenses)
      .where(sql`${licenses.zip} is not null AND ${licenses.zip} != ''`)
      .groupBy(licenses.zip)
      .having(sql`COUNT(*) >= 3`);

    return zips
      .filter((z) => z.zip)
      .map((z) => ({
        url: `${BASE_URL}/zip/${z.zip}`,
        lastModified: z.lastUpdated ?? new Date(),
      }));
  } catch (e) {
    console.error("[sitemap:zip] Failed to generate sitemap:", e);
    return [];
  }
}

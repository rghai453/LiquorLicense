import { db } from "@/db";
import { licenses } from "@/db/schema";
import { sql } from "drizzle-orm";
import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://barbooktx.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const zips = await db
      .select({ zip: licenses.zip })
      .from(licenses)
      .where(sql`${licenses.zip} is not null AND ${licenses.zip} != ''`)
      .groupBy(licenses.zip);

    return zips
      .filter((z) => z.zip)
      .map((z) => ({
        url: `${BASE_URL}/zip/${z.zip}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
  } catch {
    return [];
  }
}

import { db } from "@/db";
import { licenses } from "@/db/schema";
import { sql } from "drizzle-orm";
import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://barbooktx.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const counties = await db
      .select({ county: licenses.county })
      .from(licenses)
      .where(sql`${licenses.county} is not null AND ${licenses.county} != ''`)
      .groupBy(licenses.county);

    return counties
      .filter((c) => c.county)
      .map((c) => ({
        url: `${BASE_URL}/counties/${encodeURIComponent(c.county!.toLowerCase())}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
  } catch {
    return [];
  }
}

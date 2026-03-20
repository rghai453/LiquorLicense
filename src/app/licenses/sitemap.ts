import { db } from "@/db";
import { licenses } from "@/db/schema";
import { count, sql } from "drizzle-orm";
import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://barbooktx.com";
const URLS_PER_SITEMAP = 50000;

const stateFilter = sql`LOWER(${licenses.state}) = 'tx' OR ${licenses.state} IS NULL`;

export async function generateSitemaps(): Promise<Array<{ id: number }>> {
  try {
    const [result] = await db.select({ count: count() }).from(licenses).where(stateFilter);
    const total = Number(result?.count) || 0;
    const numSitemaps = Math.ceil(total / URLS_PER_SITEMAP);
    return Array.from({ length: Math.max(numSitemaps, 1) }, (_, i) => ({
      id: i,
    }));
  } catch (e) {
    console.error("[sitemap:licenses] Failed to count licenses:", e);
    return [{ id: 0 }];
  }
}

export default async function sitemap(props: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const id = Number(await props.id);
  const offset = id * URLS_PER_SITEMAP;

  try {
    const batch = await db
      .select({ slug: licenses.slug, updatedAt: licenses.updatedAt })
      .from(licenses)
      .where(stateFilter)
      .orderBy(licenses.slug)
      .limit(URLS_PER_SITEMAP)
      .offset(offset);

    return batch.map((l) => ({
      url: `${BASE_URL}/licenses/${l.slug}`,
      lastModified: l.updatedAt ? new Date(l.updatedAt) : new Date(),
    }));
  } catch (e) {
    console.error("[sitemap:licenses] Failed to generate sitemap:", e);
    return [];
  }
}

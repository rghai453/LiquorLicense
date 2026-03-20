import { db } from "@/db";
import { licenses } from "@/db/schema";
import { count, sql } from "drizzle-orm";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://barbooktx.com";
const URLS_PER_SITEMAP = 50000;

export async function GET(): Promise<Response> {
  let numLicenseSitemaps = 1;
  try {
    const [result] = await db
      .select({ count: count() })
      .from(licenses)
      .where(sql`LOWER(${licenses.state}) = 'tx' OR ${licenses.state} IS NULL`);
    const total = Number(result?.count) || 0;
    numLicenseSitemaps = Math.max(Math.ceil(total / URLS_PER_SITEMAP), 1);
  } catch {
    // Fall back to 1
  }

  const sitemaps = [
    `${BASE_URL}/sitemap.xml`,
    ...Array.from({ length: numLicenseSitemaps }, (_, i) => `${BASE_URL}/licenses/sitemap/${i}.xml`),
    `${BASE_URL}/cities/sitemap.xml`,
    `${BASE_URL}/counties/sitemap.xml`,
    `${BASE_URL}/zip/sitemap.xml`,
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map((url) => `  <sitemap><loc>${url}</loc></sitemap>`).join("\n")}
</sitemapindex>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}

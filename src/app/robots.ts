import { db } from "@/db";
import { licenses } from "@/db/schema";
import { count } from "drizzle-orm";

const URLS_PER_SITEMAP = 50000;

export default async function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://barbooktx.com";

  // Figure out how many license sitemap chunks exist
  let numLicenseSitemaps = 1;
  try {
    const [result] = await db.select({ count: count() }).from(licenses);
    const total = Number(result?.count) || 0;
    numLicenseSitemaps = Math.max(Math.ceil(total / URLS_PER_SITEMAP), 1);
  } catch {
    // Fall back to 1 sitemap if DB is unreachable
  }

  const licenseSitemaps = Array.from(
    { length: numLicenseSitemaps },
    (_, i) => `${baseUrl}/licenses/sitemap/${i}.xml`
  );

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
      {
        userAgent: "CCBot",
        disallow: "/",
      },
      {
        userAgent: "anthropic-ai",
        disallow: "/",
      },
      {
        userAgent: "cohere-ai",
        disallow: "/",
      },
      {
        userAgent: "Bytespider",
        disallow: "/",
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      ...licenseSitemaps,
      `${baseUrl}/cities/sitemap.xml`,
      `${baseUrl}/counties/sitemap.xml`,
      `${baseUrl}/zip/sitemap.xml`,
    ],
  };
}

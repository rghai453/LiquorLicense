import Link from "next/link";
import { db } from "@/db";
import { licenses, revenue } from "@/db/schema";
import { sql, desc, count, sum } from "drizzle-orm";
import { StatCards } from "@/components/stats/StatCards";

export const revalidate = 3600;

async function getHomeStats(): Promise<{
  totalLicenses: number;
  totalCities: number;
  totalCounties: number;
  totalRevenue: number;
}> {
  const [licenseCount] = await db
    .select({ count: count() })
    .from(licenses);

  const [cityCount] = await db
    .select({ count: sql<number>`count(distinct ${licenses.city})` })
    .from(licenses);

  const [countyCount] = await db
    .select({ count: sql<number>`count(distinct ${licenses.county})` })
    .from(licenses);

  const [revenueTotal] = await db
    .select({ total: sum(revenue.totalReceipts) })
    .from(revenue);

  return {
    totalLicenses: licenseCount?.count ?? 0,
    totalCities: Number(cityCount?.count ?? 0),
    totalCounties: Number(countyCount?.count ?? 0),
    totalRevenue: Number(revenueTotal?.total ?? 0),
  };
}

async function getTopCities(): Promise<{ city: string; count: number }[]> {
  const results = await db
    .select({
      city: licenses.city,
      count: count(),
    })
    .from(licenses)
    .where(sql`${licenses.city} is not null AND ${licenses.city} != ''`)
    .groupBy(licenses.city)
    .orderBy(desc(count()))
    .limit(12);

  return results.map((r) => ({ city: r.city!, count: r.count }));
}

async function getRecentLicenses(): Promise<
  { businessName: string; city: string; licenseType: string; slug: string }[]
> {
  const results = await db
    .select({
      businessName: licenses.businessName,
      city: licenses.city,
      licenseType: licenses.licenseType,
      slug: licenses.slug,
    })
    .from(licenses)
    .orderBy(desc(licenses.createdAt))
    .limit(8);

  return results.map((r) => ({
    businessName: r.businessName,
    city: r.city ?? "",
    licenseType: r.licenseType,
    slug: r.slug,
  }));
}

export default async function HomePage(): Promise<React.ReactElement> {
  const [stats, topCities, recentLicenses] = await Promise.all([
    getHomeStats(),
    getTopCities(),
    getRecentLicenses(),
  ]);

  const formattedStats = [
    { label: "Active Licenses", value: stats.totalLicenses.toLocaleString() },
    { label: "Cities Covered", value: stats.totalCities.toLocaleString() },
    { label: "Counties", value: stats.totalCounties.toLocaleString() },
    {
      label: "Total Revenue Tracked",
      value: `$${(stats.totalRevenue / 100).toLocaleString()}`,
    },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-gray-900 text-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Texas Liquor License{" "}
              <span className="text-amber-500">Intelligence</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Search verified TABC license data, monthly revenue reports,
              violations, and contact info for every liquor-licensed
              establishment in Texas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/directory"
                className="inline-flex items-center justify-center px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors"
              >
                Browse Directory
              </Link>
              <Link
                href="/top-revenue"
                className="inline-flex items-center justify-center px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
              >
                Top Revenue Bars
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-4 -mt-8">
        <StatCards stats={formattedStats} />
      </section>

      {/* Browse by City */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold mb-6">Browse by City</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {topCities.map((item) => (
            <Link
              key={item.city}
              href={`/cities/${encodeURIComponent(item.city.toLowerCase())}`}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:border-amber-500 hover:shadow-md transition-all"
            >
              <p className="font-semibold text-gray-900">{item.city}</p>
              <p className="text-sm text-gray-600">
                {item.count.toLocaleString()} licenses
              </p>
            </Link>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link
            href="/directory"
            className="text-amber-600 hover:text-amber-700 font-medium"
          >
            View all cities →
          </Link>
        </div>
      </section>

      {/* Recent Licenses */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold mb-6">Recently Added</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentLicenses.map((lic) => (
            <Link
              key={lic.slug}
              href={`/licenses/${lic.slug}`}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:border-amber-500 hover:shadow-md transition-all"
            >
              <p className="font-semibold text-gray-900 truncate">
                {lic.businessName}
              </p>
              <p className="text-sm text-gray-600">{lic.city}</p>
              <span className="inline-block mt-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                {lic.licenseType}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Need Contact Info & Revenue Data?
          </h2>
          <p className="text-gray-300 mb-8 text-lg">
            Upgrade to Pro for unlimited contact reveals, revenue reports, email
            alerts, and CSV exports.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors text-lg"
          >
            View Pricing — $29/mo
          </Link>
        </div>
      </section>

      {/* Trust */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center text-sm text-gray-600">
          <p>
            Data sourced from the Texas Alcoholic Beverage Commission (TABC) and
            Texas Comptroller Mixed Beverage Gross Receipts reports. Updated
            daily.
          </p>
        </div>
      </section>
    </div>
  );
}

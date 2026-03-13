import { db } from "@/db";
import { licenses } from "@/db/schema";
import { sql, ilike, count, desc } from "drizzle-orm";
import Link from "next/link";
import type { Metadata } from "next";
import { StatCards } from "@/components/stats/StatCards";

export const revalidate = 86400;

interface CityPageProps {
  params: Promise<{ city: string }>;
}

export async function generateMetadata({
  params,
}: CityPageProps): Promise<Metadata> {
  const { city } = await params;
  const cityName = decodeURIComponent(city).replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    title: `Liquor Licenses in ${cityName}, TX`,
    description: `Browse all active liquor licenses in ${cityName}, Texas. View establishment details, revenue data, and TABC license info.`,
  };
}

export default async function CityPage({
  params,
}: CityPageProps): Promise<React.ReactElement> {
  const { city } = await params;
  const cityName = decodeURIComponent(city).replace(/\b\w/g, (c) => c.toUpperCase());

  const [results, [totalResult], typeBreakdown] = await Promise.all([
    db
      .select()
      .from(licenses)
      .where(ilike(licenses.city, cityName))
      .orderBy(desc(licenses.createdAt))
      .limit(24),
    db
      .select({ count: count() })
      .from(licenses)
      .where(ilike(licenses.city, cityName)),
    db
      .select({ type: licenses.licenseType, count: count() })
      .from(licenses)
      .where(ilike(licenses.city, cityName))
      .groupBy(licenses.licenseType)
      .orderBy(desc(count())),
  ]);

  const total = totalResult?.count ?? 0;
  const statusColor: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    suspended: "bg-yellow-100 text-yellow-800",
    revoked: "bg-red-100 text-red-800",
    expired: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-amber-600">Home</Link>
        {" / "}
        <Link href="/directory" className="hover:text-amber-600">Directory</Link>
        {" / "}
        <span className="text-gray-900">{cityName}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">
        Liquor Licenses in {cityName}, TX
      </h1>
      <p className="text-gray-700 mb-6">
        {total.toLocaleString()} verified TABC licenses
      </p>

      <StatCards
        stats={[
          { label: "Total Licenses", value: total.toLocaleString() },
          { label: "License Types", value: typeBreakdown.length.toString() },
        ]}
      />

      {/* Type Breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 my-6">
        <h2 className="text-xl font-bold mb-4">License Types in {cityName}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {typeBreakdown.map((t) => (
            <Link
              key={t.type}
              href={`/directory?type=${encodeURIComponent(t.type)}&city=${encodeURIComponent(cityName)}`}
              className="flex justify-between items-center p-3 rounded-lg border border-gray-200 hover:border-amber-500 transition-colors"
            >
              <span className="font-medium text-sm">{t.type}</span>
              <span className="text-sm text-gray-600">{t.count}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Listings */}
      <h2 className="text-xl font-bold mb-4">Establishments</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {results.map((lic) => (
          <Link
            key={lic.id}
            href={`/licenses/${lic.slug}`}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:border-amber-500 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-semibold text-gray-900 truncate flex-1">{lic.businessName}</h3>
              <span className={`text-xs px-2 py-0.5 rounded ml-2 ${statusColor[lic.status.toLowerCase()] || "bg-gray-100"}`}>
                {lic.status}
              </span>
            </div>
            <p className="text-sm text-gray-700">{lic.address}</p>
            <span className="inline-block mt-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
              {lic.licenseType}
            </span>
          </Link>
        ))}
      </div>

      {total > 24 && (
        <div className="text-center">
          <Link
            href={`/directory?city=${encodeURIComponent(cityName)}`}
            className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
          >
            View All {total.toLocaleString()} Licenses in {cityName}
          </Link>
        </div>
      )}
    </div>
  );
}

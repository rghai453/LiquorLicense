import { db } from "@/db";
import { licenses } from "@/db/schema";
import { ilike, count, desc } from "drizzle-orm";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 86400;

interface TypePageProps {
  params: Promise<{ type: string }>;
}

export async function generateMetadata({ params }: TypePageProps): Promise<Metadata> {
  const { type } = await params;
  const typeName = decodeURIComponent(type).replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    title: `${typeName} Licenses in Texas`,
    description: `Browse all ${typeName} liquor licenses in Texas. Verified TABC data with contact info and revenue reports.`,
  };
}

export default async function TypePage({ params }: TypePageProps): Promise<React.ReactElement> {
  const { type } = await params;
  const typeName = decodeURIComponent(type).replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const [results, [totalResult], topCities] = await Promise.all([
    db.select().from(licenses).where(ilike(licenses.licenseType, `%${typeName}%`)).orderBy(desc(licenses.createdAt)).limit(24),
    db.select({ count: count() }).from(licenses).where(ilike(licenses.licenseType, `%${typeName}%`)),
    db.select({ city: licenses.city, count: count() }).from(licenses).where(ilike(licenses.licenseType, `%${typeName}%`)).groupBy(licenses.city).orderBy(desc(count())).limit(12),
  ]);

  const total = totalResult?.count ?? 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-amber-600">Home</Link>{" / "}
        <Link href="/directory" className="hover:text-amber-600">Directory</Link>{" / "}
        <span className="text-gray-900">{typeName}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">{typeName} Licenses in Texas</h1>
      <p className="text-gray-700 mb-8">{total.toLocaleString()} verified TABC licenses</p>

      {/* Top Cities */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Top Cities</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {topCities.map((c) => c.city && (
            <Link key={c.city} href={`/directory/${encodeURIComponent(type)}/${encodeURIComponent(c.city.toLowerCase())}`}
              className="bg-white rounded-lg border border-gray-200 p-3 hover:border-amber-500 transition-colors flex justify-between items-center">
              <span className="font-medium text-sm">{c.city}</span>
              <span className="text-sm text-gray-600">{c.count}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((lic) => (
          <Link key={lic.id} href={`/licenses/${lic.slug}`}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:border-amber-500 hover:shadow-md transition-all">
            <h3 className="font-semibold text-gray-900 truncate">{lic.businessName}</h3>
            <p className="text-sm text-gray-700">{lic.address}</p>
            <p className="text-sm text-gray-600">{lic.city}, {lic.county} County</p>
          </Link>
        ))}
      </div>

      {total > 24 && (
        <div className="text-center mt-8">
          <Link href={`/directory?type=${encodeURIComponent(typeName)}`}
            className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors">
            View All {total.toLocaleString()} {typeName} Licenses
          </Link>
        </div>
      )}
    </div>
  );
}

import { db } from "@/db";
import { licenses } from "@/db/schema";
import { ilike, and, count, desc } from "drizzle-orm";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 86400;

interface TypeCityPageProps {
  params: Promise<{ type: string; city: string }>;
}

export async function generateMetadata({ params }: TypeCityPageProps): Promise<Metadata> {
  const { type, city } = await params;
  const typeName = decodeURIComponent(type).replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const cityName = decodeURIComponent(city).replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    title: `${typeName} in ${cityName}, TX — Liquor Licenses`,
    description: `Browse ${typeName.toLowerCase()} liquor licenses in ${cityName}, Texas. Verified TABC data with details and contact info.`,
  };
}

export default async function TypeCityPage({ params }: TypeCityPageProps): Promise<React.ReactElement> {
  const { type, city } = await params;
  const typeName = decodeURIComponent(type).replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const cityName = decodeURIComponent(city).replace(/\b\w/g, (c) => c.toUpperCase());

  const where = and(
    ilike(licenses.licenseType, `%${typeName}%`),
    ilike(licenses.city, cityName)
  );

  const [results, [totalResult]] = await Promise.all([
    db.select().from(licenses).where(where).orderBy(desc(licenses.createdAt)).limit(50),
    db.select({ count: count() }).from(licenses).where(where),
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
        <Link href="/" className="hover:text-amber-600">Home</Link>{" / "}
        <Link href="/directory" className="hover:text-amber-600">Directory</Link>{" / "}
        <Link href={`/directory/${encodeURIComponent(type)}`} className="hover:text-amber-600">{typeName}</Link>{" / "}
        <span className="text-gray-900">{cityName}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">{typeName} in {cityName}, TX</h1>
      <p className="text-gray-700 mb-8">{total.toLocaleString()} verified TABC licenses</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((lic) => (
          <Link key={lic.id} href={`/licenses/${lic.slug}`}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:border-amber-500 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-semibold text-gray-900 truncate flex-1">{lic.businessName}</h3>
              <span className={`text-xs px-2 py-0.5 rounded ml-2 ${statusColor[lic.status.toLowerCase()] || "bg-gray-100"}`}>{lic.status}</span>
            </div>
            <p className="text-sm text-gray-700">{lic.address}</p>
            {lic.ownerName && <p className="text-xs text-gray-600 mt-1">Owner: {lic.ownerName}</p>}
          </Link>
        ))}
      </div>

      {results.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-600">
          No {typeName.toLowerCase()} licenses found in {cityName}.
        </div>
      )}
    </div>
  );
}

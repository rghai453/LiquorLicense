import { db } from "@/db";
import { licenses } from "@/db/schema";
import { eq, count, desc } from "drizzle-orm";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 86400;

interface ZipPageProps {
  params: Promise<{ zip: string }>;
}

export async function generateMetadata({ params }: ZipPageProps): Promise<Metadata> {
  const { zip } = await params;
  return {
    title: `Liquor Licenses in ZIP ${zip} — Texas`,
    description: `Browse all TABC liquor licenses in ZIP code ${zip}, Texas. View establishment details and license data.`,
  };
}

export default async function ZipPage({ params }: ZipPageProps): Promise<React.ReactElement> {
  const { zip } = await params;

  const [results, [totalResult]] = await Promise.all([
    db.select().from(licenses).where(eq(licenses.zip, zip)).orderBy(desc(licenses.createdAt)).limit(50),
    db.select({ count: count() }).from(licenses).where(eq(licenses.zip, zip)),
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
        <span className="text-gray-900">ZIP {zip}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">Liquor Licenses in ZIP {zip}</h1>
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
            <p className="text-sm text-gray-600">{lic.city}, {lic.county} County</p>
            <span className="inline-block mt-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">{lic.licenseType}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

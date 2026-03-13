import { db } from "@/db";
import { licenses } from "@/db/schema";
import { desc, count, sql } from "drizzle-orm";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New License Applications — Texas Liquor Licenses",
  description: "View recently filed TABC liquor license applications in Texas. New bars, restaurants, and package stores opening soon.",
};

export const revalidate = 3600;

export default async function NewApplicationsPage(): Promise<React.ReactElement> {
  // Show most recently issued licenses as proxy for new applications
  const results = await db
    .select()
    .from(licenses)
    .where(sql`${licenses.issueDate} is not null`)
    .orderBy(desc(licenses.issueDate))
    .limit(50);

  const [totalResult] = await db.select({ count: count() }).from(licenses);
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
        <span className="text-gray-900">New Applications</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">New License Applications</h1>
      <p className="text-gray-700 mb-4">Recently filed TABC liquor license applications in Texas</p>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 text-sm">
        <p className="font-medium text-amber-800">Sales teams: New license applications mean new businesses that need supplies, insurance, POS systems, and more.</p>
        <Link href="/pricing" className="text-amber-700 hover:text-amber-800 font-semibold mt-1 inline-block">
          Get email alerts for new applications →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((lic) => (
          <Link key={lic.id} href={`/licenses/${lic.slug}`}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:border-amber-500 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-semibold text-gray-900 truncate flex-1">{lic.businessName}</h3>
              <span className={`text-xs px-2 py-0.5 rounded ml-2 ${statusColor[lic.status.toLowerCase()] || "bg-gray-100"}`}>{lic.status}</span>
            </div>
            <p className="text-sm text-gray-700">{lic.address}</p>
            <p className="text-sm text-gray-600">{lic.city}, TX</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">{lic.licenseType}</span>
              {lic.issueDate && <span className="text-xs text-gray-400">Issued: {lic.issueDate}</span>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

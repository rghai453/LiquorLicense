import { db } from "@/db";
import { violations, licenses } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recent Violations & Suspensions — Texas Liquor Licenses",
  description: "View recent TABC violations, suspensions, and enforcement actions against Texas liquor license holders.",
};

export const revalidate = 3600;

export default async function ViolationsPage(): Promise<React.ReactElement> {
  const results = await db
    .select({
      violation: violations,
      license: {
        businessName: licenses.businessName,
        city: licenses.city,
        slug: licenses.slug,
      },
    })
    .from(violations)
    .leftJoin(licenses, eq(violations.licenseId, licenses.id))
    .orderBy(desc(violations.date))
    .limit(50);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-amber-600">Home</Link>{" / "}
        <span className="text-gray-900">Violations</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">Recent Violations & Suspensions</h1>
      <p className="text-gray-700 mb-8">TABC enforcement actions against Texas liquor license holders</p>

      {results.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-600">
          <p className="text-lg">No violations data available yet.</p>
          <p className="text-sm mt-2">Violation data will be populated as we expand our TABC data pipeline.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map(({ violation, license }) => (
            <div key={violation.id} className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">
                    {license?.slug ? (
                      <Link href={`/licenses/${license.slug}`} className="text-amber-600 hover:text-amber-700">
                        {license.businessName}
                      </Link>
                    ) : (
                      <span>License #{violation.licenseNumber}</span>
                    )}
                  </h3>
                  {license?.city && <p className="text-sm text-gray-600">{license.city}, TX</p>}
                </div>
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded whitespace-nowrap">
                  {violation.violationType}
                </span>
              </div>
              {violation.description && (
                <p className="text-sm text-gray-700 mt-2">{violation.description}</p>
              )}
              <div className="flex gap-4 text-xs text-gray-600 mt-3">
                {violation.date && <span>Date: {violation.date}</span>}
                {violation.disposition && <span>Disposition: {violation.disposition}</span>}
                {violation.penalty && <span>Penalty: {violation.penalty}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

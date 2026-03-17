import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { getRecentViolations } from "@/db/queries";
import { AdSlot } from "@/components/ads/AdSlot";

export const metadata: Metadata = {
  title: "Recent Violations & Suspensions — Texas Liquor Licenses",
  description: "View recent TABC violations, suspensions, and enforcement actions against Texas liquor license holders.",
  alternates: { canonical: "/violations" },
};

export const revalidate = 3600;

export default async function ViolationsPage(): Promise<React.ReactElement> {
  const results = await getRecentViolations();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-stone-400">
        <Link href="/" className="transition-colors hover:text-amber-600">Home</Link>
        <ChevronRight className="size-3" />
        <span className="font-medium text-stone-700">Violations</span>
      </nav>

      <h1 className="text-3xl font-bold tracking-tight text-stone-900">
        Recent Violations & Suspensions
      </h1>
      <p className="mt-1 text-sm text-stone-500 mb-6">
        TABC enforcement actions against Texas liquor license holders
      </p>

      {results.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-stone-200/80 bg-white py-20">
          <p className="text-lg font-semibold text-stone-700">No violations data available yet</p>
          <p className="mt-1 text-sm text-stone-400">
            Violation data will be populated as we expand our TABC data pipeline.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map(({ violation, license }) => (
            <div
              key={violation.id}
              className="rounded-xl border border-stone-200/80 bg-white p-5 transition-colors hover:border-stone-300/80"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  {license?.slug ? (
                    <Link
                      href={`/licenses/${license.slug}`}
                      className="text-sm font-semibold text-stone-800 transition-colors hover:text-amber-700"
                    >
                      {license.businessName}
                    </Link>
                  ) : (
                    <span className="text-sm font-semibold text-stone-800">
                      License #{violation.licenseNumber}
                    </span>
                  )}
                  {license?.city && (
                    <p className="mt-0.5 text-xs text-stone-400">{license.city}, TX</p>
                  )}
                </div>
                <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700 ring-1 ring-red-200/50">
                  {violation.violationType}
                </span>
              </div>
              {(violation.description || violation.date || violation.disposition || violation.penalty) && (
                <div className="mt-3 border-t border-stone-100 pt-3">
                  {violation.description && (
                    <p className="text-sm text-stone-600 mb-2">{violation.description}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-xs text-stone-400">
                    {violation.date && <span>Date: {violation.date}</span>}
                    {violation.disposition && <span>Disposition: {violation.disposition}</span>}
                    {violation.penalty && <span>Penalty: {violation.penalty}</span>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <AdSlot slot="violations-bottom" format="horizontal" className="mt-10" />
    </div>
  );
}

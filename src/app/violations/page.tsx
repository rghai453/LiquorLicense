import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { getViolations, getViolationTypes } from "@/db/queries";
import { Pagination } from "@/components/directory/Pagination";
import { AdSlot } from "@/components/ads/AdSlot";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildCollectionPage, buildBreadcrumbList, BASE_URL } from "@/components/seo/schemas";

interface ViolationsPageProps {
  searchParams: Promise<{ page?: string; type?: string }>;
}

export async function generateMetadata({ searchParams }: ViolationsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  return {
    title: "Recent Violations & Suspensions — Texas Liquor Licenses",
    description: "View recent TABC violations, suspensions, and enforcement actions against Texas liquor license holders.",
    alternates: { canonical: page > 1 ? `/violations?page=${page}` : "/violations" },
  };
}

export const revalidate = 3600;

const PAGE_SIZE = 24;

export default async function ViolationsPage({ searchParams }: ViolationsPageProps): Promise<React.ReactElement> {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const offset = (page - 1) * PAGE_SIZE;

  const [{ results, total }, violationTypes] = await Promise.all([
    getViolations({ type: params.type }, PAGE_SIZE, offset),
    getViolationTypes(),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

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
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-500 mb-6">
        The Texas Alcoholic Beverage Commission (TABC) investigates and enforces liquor law
        violations across the state. Common violations include sales to minors, operating after
        hours, and health code infractions. Dispositions range from warnings to license suspension
        and cancellation. This page lists {total.toLocaleString()} enforcement actions from TABC
        public records, updated as new data becomes available.
      </p>

      {violationTypes.length > 0 && (
        <form method="GET" action="/violations" className="mb-6 flex items-center gap-3">
          <select
            name="type"
            defaultValue={params.type || ""}
            className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 shadow-sm"
          >
            <option value="">All violation types</option>
            {violationTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-800"
          >
            Filter
          </button>
        </form>
      )}

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

      <div className="mt-10">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          basePath="/violations"
          searchParams={params.type ? { type: params.type } : {}}
        />
      </div>

      <AdSlot slot="violations-bottom" format="horizontal" className="mt-10" />

      <JsonLd data={[
        buildCollectionPage({
          name: "TABC Violations & Suspensions",
          description: `Browse ${total.toLocaleString()} TABC enforcement actions against Texas liquor license holders.`,
          url: `${BASE_URL}/violations`,
        }),
        buildBreadcrumbList([
          { name: "Home", url: BASE_URL },
          { name: "Violations" },
        ]),
      ]} />
    </div>
  );
}

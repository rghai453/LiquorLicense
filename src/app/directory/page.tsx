import Link from "next/link";
import type { Metadata } from "next";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { DirectoryFilters } from "@/components/directory/DirectoryFilters";
import { FileX2, ArrowUpRight } from "lucide-react";
import { getDirectoryResults } from "@/db/queries";
import { AdSlot } from "@/components/ads/AdSlot";

export const revalidate = 3600;

interface DirectoryPageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
    city?: string;
    county?: string;
    status?: string;
    page?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: DirectoryPageProps): Promise<Metadata> {
  const params = await searchParams;
  const parts = ["Texas Liquor Licenses"];
  if (params.type) parts.push(params.type);
  if (params.city) parts.push(`in ${params.city}`);
  if (params.county) parts.push(`${params.county} County`);

  return {
    title: parts.join(" — "),
    description: `Browse ${parts.join(" ")}. Search verified TABC license data with BarBook Texas.`,
    alternates: { canonical: "/directory" },
  };
}

const PAGE_SIZE = 24;

export default async function DirectoryPage({
  searchParams,
}: DirectoryPageProps): Promise<React.ReactElement> {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const offset = (page - 1) * PAGE_SIZE;

  const { results, total } = await getDirectoryResults(
    {
      q: params.q,
      type: params.type,
      city: params.city,
      county: params.county,
      status: params.status,
    },
    PAGE_SIZE,
    offset
  );

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function buildUrl(newParams: Record<string, string>): string {
    const merged = { ...params, ...newParams };
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) {
      if (v) sp.set(k, v);
    }
    return `/directory?${sp.toString()}`;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">
          Texas Liquor License Directory
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          {total.toLocaleString()} active licenses
        </p>
      </div>

      <div className="mb-8 rounded-xl border border-stone-200/80 bg-white p-4">
        <DirectoryFilters />
      </div>

      <AdSlot slot="directory-top" format="horizontal" className="mb-8" />

      {results.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-stone-200/80 bg-white py-20">
          <FileX2 className="size-10 text-stone-300 mb-4" />
          <p className="text-lg font-semibold text-stone-700">No licenses found</p>
          <p className="mt-1 text-sm text-stone-400">
            Try adjusting your search or filters.
          </p>
          <Link
            href="/directory"
            className="mt-5 inline-flex items-center rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 transition-colors hover:border-stone-300 hover:bg-stone-50"
          >
            Clear filters
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 mb-10">
            {results.map((lic) => {
              const locationParts = [
                lic.city,
                lic.county ? `${lic.county} Co.` : null,
              ]
                .filter(Boolean)
                .join(", ");

              return (
                <Link key={lic.id} href={`/licenses/${lic.slug}`} className="group">
                  <div className="relative h-full overflow-hidden rounded-xl border border-stone-200/80 bg-white p-4 transition-all duration-200 hover:border-amber-300/60 hover:shadow-md hover:shadow-amber-900/5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-sm leading-snug text-stone-800 truncate flex-1 transition-colors group-hover:text-amber-700">
                        {lic.businessName}
                      </p>
                      <ArrowUpRight className="size-3.5 shrink-0 text-stone-300 transition-all group-hover:text-amber-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                    {lic.dba && lic.dba !== lic.businessName && (
                      <p className="mt-1 text-xs text-stone-400 truncate">
                        DBA: {lic.dba}
                      </p>
                    )}
                    <p className="mt-1.5 text-sm text-stone-500">{lic.address}</p>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-600">
                        {lic.licenseType}
                      </span>
                      {locationParts && (
                        <span className="text-xs text-stone-400">{locationParts}</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {totalPages > 1 && (
            <nav aria-label="Pagination" className="flex items-center justify-center gap-1">
              {page > 1 && (
                <Link
                  href={buildUrl({ page: String(page - 1) })}
                  className="inline-flex h-9 items-center rounded-lg border border-stone-200 bg-white px-3 text-sm font-medium text-stone-600 transition-colors hover:border-stone-300 hover:bg-stone-50"
                >
                  Previous
                </Link>
              )}
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 7) {
                  pageNum = i + 1;
                } else if (page <= 4) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
                } else {
                  pageNum = page - 3 + i;
                }
                const isActive = pageNum === page;
                return (
                  <Link
                    key={pageNum}
                    href={buildUrl({ page: String(pageNum) })}
                    className={cn(
                      "inline-flex size-9 items-center justify-center rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-stone-900 text-white"
                        : "border border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {pageNum}
                  </Link>
                );
              })}
              {page < totalPages && (
                <Link
                  href={buildUrl({ page: String(page + 1) })}
                  className="inline-flex h-9 items-center rounded-lg border border-stone-200 bg-white px-3 text-sm font-medium text-stone-600 transition-colors hover:border-stone-300 hover:bg-stone-50"
                >
                  Next
                </Link>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}

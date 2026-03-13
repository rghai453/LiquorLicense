import { db } from "@/db";
import { licenses } from "@/db/schema";
import { sql, desc, eq, ilike, and, count } from "drizzle-orm";
import Link from "next/link";
import type { Metadata } from "next";

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
    description: `Browse ${parts.join(" ")}. Search verified TABC license data with LiquorScope.`,
  };
}

const PAGE_SIZE = 24;

export default async function DirectoryPage({
  searchParams,
}: DirectoryPageProps): Promise<React.ReactElement> {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const offset = (page - 1) * PAGE_SIZE;

  const conditions = [];
  if (params.q) {
    conditions.push(
      sql`(${ilike(licenses.businessName, `%${params.q}%`)} OR ${ilike(licenses.dba, `%${params.q}%`)})`
    );
  }
  if (params.type) {
    conditions.push(ilike(licenses.licenseType, `%${params.type}%`));
  }
  if (params.city) {
    conditions.push(ilike(licenses.city, params.city));
  }
  if (params.county) {
    conditions.push(ilike(licenses.county, params.county));
  }
  if (params.status) {
    conditions.push(ilike(licenses.status, params.status));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [results, [totalResult]] = await Promise.all([
    db
      .select()
      .from(licenses)
      .where(where)
      .orderBy(desc(licenses.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset),
    db.select({ count: count() }).from(licenses).where(where),
  ]);

  const total = totalResult?.count ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  function buildUrl(newParams: Record<string, string>): string {
    const merged = { ...params, ...newParams };
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) {
      if (v) sp.set(k, v);
    }
    return `/directory?${sp.toString()}`;
  }

  const statusColor: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    suspended: "bg-yellow-100 text-yellow-800",
    revoked: "bg-red-100 text-red-800",
    expired: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Texas Liquor License Directory</h1>
        <p className="text-gray-700 mt-1">
          {total.toLocaleString()} licenses found
        </p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <form method="GET" action="/directory" className="flex flex-wrap gap-3">
          <input
            type="text"
            name="q"
            defaultValue={params.q}
            placeholder="Search by business name..."
            className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
          />
          <select
            name="type"
            defaultValue={params.type}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="">All Types</option>
            <option value="Mixed Beverage">Mixed Beverage</option>
            <option value="Beer & Wine">Beer & Wine</option>
            <option value="Package Store">Package Store</option>
            <option value="Brewpub">Brewpub</option>
            <option value="Manufacturer">Manufacturer</option>
            <option value="Wholesaler">Wholesaler</option>
          </select>
          <select
            name="status"
            defaultValue={params.status}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="expired">Expired</option>
            <option value="revoked">Revoked</option>
          </select>
          <input
            type="text"
            name="city"
            defaultValue={params.city}
            placeholder="City"
            className="w-32 px-4 py-2 border border-gray-300 rounded-lg"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
          >
            Search
          </button>
          {(params.q || params.type || params.city || params.status) && (
            <Link
              href="/directory"
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Clear
            </Link>
          )}
        </form>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {results.map((lic) => (
          <Link
            key={lic.id}
            href={`/licenses/${lic.slug}`}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:border-amber-500 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900 truncate flex-1">
                {lic.businessName}
              </h3>
              <span
                className={`text-xs px-2 py-0.5 rounded ml-2 whitespace-nowrap ${statusColor[lic.status.toLowerCase()] || "bg-gray-100 text-gray-600"}`}
              >
                {lic.status}
              </span>
            </div>
            {lic.dba && lic.dba !== lic.businessName && (
              <p className="text-sm text-gray-600 truncate">
                DBA: {lic.dba}
              </p>
            )}
            <p className="text-sm text-gray-700 mt-1">{lic.address}</p>
            <p className="text-sm text-gray-600">
              {[lic.city, lic.county ? `${lic.county} County` : null]
                .filter(Boolean)
                .join(", ")}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                {lic.licenseType}
              </span>
              <span className="text-xs text-gray-400">#{lic.licenseNumber}</span>
            </div>
          </Link>
        ))}
      </div>

      {results.length === 0 && (
        <div className="text-center py-12 text-gray-600">
          <p className="text-lg">No licenses found matching your criteria.</p>
          <Link href="/directory" className="text-amber-600 hover:text-amber-700 mt-2 inline-block">
            Clear filters
          </Link>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={buildUrl({ page: String(page - 1) })}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
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
            return (
              <Link
                key={pageNum}
                href={buildUrl({ page: String(pageNum) })}
                className={`px-4 py-2 rounded-lg ${
                  pageNum === page
                    ? "bg-amber-600 text-white"
                    : "border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {pageNum}
              </Link>
            );
          })}
          {page < totalPages && (
            <Link
              href={buildUrl({ page: String(page + 1) })}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

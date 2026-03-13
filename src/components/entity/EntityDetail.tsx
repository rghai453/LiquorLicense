import type React from "react";
import type { License, Revenue, Violation } from "@/types";

interface EntityDetailProps {
  license: License;
  revenue: Revenue[];
  violations: Violation[];
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  suspended: "bg-yellow-100 text-yellow-800",
  expired: "bg-gray-100 text-gray-800",
  revoked: "bg-red-100 text-red-800",
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatCurrency(cents: number | null): string {
  if (cents === null) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function formatMonth(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
}

export function EntityDetail({
  license,
  revenue,
  violations,
}: EntityDetailProps): React.ReactElement {
  const statusClass =
    STATUS_STYLES[license.status.toLowerCase()] ?? "bg-gray-100 text-gray-800";

  const showDba =
    license.dba &&
    license.dba.toLowerCase() !== license.businessName.toLowerCase();

  const recentRevenue = revenue
    .sort(
      (a, b) =>
        new Date(b.reportMonth).getTime() - new Date(a.reportMonth).getTime()
    )
    .slice(0, 12);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-start gap-3">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {license.businessName}
          </h1>
          <span
            className={`mt-1 inline-flex items-center rounded-full px-3 py-1 text-sm font-medium capitalize ${statusClass}`}
          >
            {license.status}
          </span>
        </div>

        {showDba && (
          <p className="mt-1 text-lg text-gray-500">DBA: {license.dba}</p>
        )}

        <div className="mt-3 flex flex-wrap gap-3">
          <span className="rounded bg-amber-50 px-2.5 py-1 text-sm font-medium text-amber-800">
            {license.licenseType}
          </span>
          <span className="text-sm text-gray-500">
            License #{license.licenseNumber}
          </span>
        </div>
      </div>

      {/* Address Section */}
      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Location</h2>
        <div className="space-y-1 text-gray-700">
          {license.address && <p>{license.address}</p>}
          <p>
            {[license.city, license.state, license.zip]
              .filter(Boolean)
              .join(", ")}
          </p>
          {license.county && (
            <p className="text-gray-500">{license.county} County</p>
          )}
        </div>
      </section>

      {/* Key Dates */}
      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Key Dates
        </h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Issue Date</dt>
            <dd className="mt-1 text-gray-900">
              {formatDate(license.issueDate)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Expiration Date
            </dt>
            <dd className="mt-1 text-gray-900">
              {formatDate(license.expirationDate)}
            </dd>
          </div>
        </dl>
      </section>

      {/* Owner */}
      {license.ownerName && (
        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Owner</h2>
          <p className="text-gray-700">{license.ownerName}</p>
        </section>
      )}

      {/* Revenue Section */}
      {recentRevenue.length > 0 && (
        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Revenue (Last 12 Months)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 pr-4 font-medium text-gray-500">Month</th>
                  <th className="pb-3 pr-4 font-medium text-gray-500">
                    Total Receipts
                  </th>
                  <th className="pb-3 pr-4 font-medium text-gray-500">Beer</th>
                  <th className="pb-3 pr-4 font-medium text-gray-500">Wine</th>
                  <th className="pb-3 pr-4 font-medium text-gray-500">
                    Liquor
                  </th>
                  <th className="pb-3 font-medium text-gray-500">Tax</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentRevenue.map((rev) => (
                  <tr key={rev.id}>
                    <td className="py-2.5 pr-4 text-gray-900">
                      {formatMonth(rev.reportMonth)}
                    </td>
                    <td className="py-2.5 pr-4 text-gray-900">
                      {formatCurrency(rev.totalReceipts)}
                    </td>
                    <td className="py-2.5 pr-4 text-gray-700">
                      {formatCurrency(rev.beerReceipts)}
                    </td>
                    <td className="py-2.5 pr-4 text-gray-700">
                      {formatCurrency(rev.wineReceipts)}
                    </td>
                    <td className="py-2.5 pr-4 text-gray-700">
                      {formatCurrency(rev.liquorReceipts)}
                    </td>
                    <td className="py-2.5 text-gray-700">
                      {formatCurrency(rev.totalTax)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Violations Section */}
      {violations.length > 0 && (
        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Violations ({violations.length})
          </h2>
          <ul className="divide-y divide-gray-100">
            {violations.map((violation) => (
              <li key={violation.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-gray-900">
                      {violation.violationType}
                    </p>
                    {violation.description && (
                      <p className="mt-1 text-sm text-gray-600">
                        {violation.description}
                      </p>
                    )}
                    {violation.disposition && (
                      <p className="mt-1 text-sm text-gray-500">
                        Disposition: {violation.disposition}
                      </p>
                    )}
                    {violation.penalty && (
                      <p className="mt-1 text-sm text-gray-500">
                        Penalty: {violation.penalty}
                      </p>
                    )}
                  </div>
                  {violation.date && (
                    <span className="shrink-0 text-sm text-gray-400">
                      {formatDate(violation.date)}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

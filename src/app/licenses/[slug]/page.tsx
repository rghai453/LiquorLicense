import { db } from "@/db";
import { licenses, revenue, violations } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 86400;

interface LicensePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: LicensePageProps): Promise<Metadata> {
  const { slug } = await params;
  const [license] = await db
    .select()
    .from(licenses)
    .where(eq(licenses.slug, slug))
    .limit(1);

  if (!license) return { title: "License Not Found" };

  return {
    title: `${license.businessName} — ${license.licenseType} in ${license.city || "Texas"}`,
    description: `${license.businessName} is a verified ${license.licenseType} license holder in ${license.city || "Texas"}. License #${license.licenseNumber}. View details, revenue data, and violations from official TABC records.`,
    openGraph: {
      title: `${license.businessName} — ${license.licenseType}`,
      description: `Verified TABC license data for ${license.businessName} in ${license.city || "Texas"}.`,
    },
  };
}

export default async function LicensePage({
  params,
}: LicensePageProps): Promise<React.ReactElement> {
  const { slug } = await params;

  const [license] = await db
    .select()
    .from(licenses)
    .where(eq(licenses.slug, slug))
    .limit(1);

  if (!license) notFound();

  const [revenueData, violationData] = await Promise.all([
    license.id
      ? db
          .select()
          .from(revenue)
          .where(eq(revenue.licenseId, license.id))
          .orderBy(desc(revenue.reportMonth))
          .limit(12)
      : [],
    license.id
      ? db
          .select()
          .from(violations)
          .where(eq(violations.licenseId, license.id))
          .orderBy(desc(violations.date))
      : [],
  ]);

  const statusColor: Record<string, string> = {
    active: "bg-green-100 text-green-800 border-green-200",
    suspended: "bg-yellow-100 text-yellow-800 border-yellow-200",
    revoked: "bg-red-100 text-red-800 border-red-200",
    expired: "bg-gray-100 text-gray-600 border-gray-200",
  };

  const totalRevenue = revenueData.reduce(
    (sum, r) => sum + (r.totalReceipts ?? 0),
    0
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-amber-600">
          Home
        </Link>
        {" / "}
        <Link href="/directory" className="hover:text-amber-600">
          Directory
        </Link>
        {license.city && (
          <>
            {" / "}
            <Link
              href={`/cities/${encodeURIComponent(license.city.toLowerCase())}`}
              className="hover:text-amber-600"
            >
              {license.city}
            </Link>
          </>
        )}
        {" / "}
        <span className="text-gray-900">{license.businessName}</span>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {license.businessName}
            </h1>
            {license.dba && license.dba !== license.businessName && (
              <p className="text-lg text-gray-700 mt-1">
                DBA: {license.dba}
              </p>
            )}
            <div className="flex items-center gap-3 mt-3">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColor[license.status.toLowerCase()] || "bg-gray-100 text-gray-600"}`}
              >
                {license.status}
              </span>
              <span className="text-sm bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                {license.licenseType}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">License Number</p>
            <p className="text-lg font-mono font-semibold">
              {license.licenseNumber}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-4">License Details</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-600">Address</dt>
                <dd className="font-medium">{license.address || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">City</dt>
                <dd className="font-medium">
                  {license.city ? (
                    <Link
                      href={`/cities/${encodeURIComponent(license.city.toLowerCase())}`}
                      className="text-amber-600 hover:text-amber-700"
                    >
                      {license.city}
                    </Link>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">County</dt>
                <dd className="font-medium">
                  {license.county ? (
                    <Link
                      href={`/counties/${encodeURIComponent(license.county.toLowerCase())}`}
                      className="text-amber-600 hover:text-amber-700"
                    >
                      {license.county}
                    </Link>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">ZIP Code</dt>
                <dd className="font-medium">
                  {license.zip ? (
                    <Link
                      href={`/zip/${license.zip}`}
                      className="text-amber-600 hover:text-amber-700"
                    >
                      {license.zip}
                    </Link>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Issue Date</dt>
                <dd className="font-medium">{license.issueDate || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Expiration Date</dt>
                <dd className="font-medium">
                  {license.expirationDate || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Owner</dt>
                <dd className="font-medium">{license.ownerName || "—"}</dd>
              </div>
            </dl>
          </div>

          {/* Revenue Data */}
          {revenueData.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Revenue History</h2>
                <p className="text-sm text-gray-600">
                  Total: ${totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 font-medium text-gray-500">
                        Month
                      </th>
                      <th className="text-right py-2 font-medium text-gray-500">
                        Total
                      </th>
                      <th className="text-right py-2 font-medium text-gray-500">
                        Liquor
                      </th>
                      <th className="text-right py-2 font-medium text-gray-500">
                        Beer
                      </th>
                      <th className="text-right py-2 font-medium text-gray-500">
                        Wine
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueData.map((r) => (
                      <tr
                        key={r.id}
                        className="border-b border-gray-100"
                      >
                        <td className="py-2">{r.reportMonth}</td>
                        <td className="text-right py-2 font-medium">
                          ${(r.totalReceipts ?? 0).toLocaleString()}
                        </td>
                        <td className="text-right py-2 text-gray-700">
                          ${(r.liquorReceipts ?? 0).toLocaleString()}
                        </td>
                        <td className="text-right py-2 text-gray-700">
                          ${(r.beerReceipts ?? 0).toLocaleString()}
                        </td>
                        <td className="text-right py-2 text-gray-700">
                          ${(r.wineReceipts ?? 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Violations */}
          {violationData.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-4">Violations</h2>
              <div className="space-y-3">
                {violationData.map((v) => (
                  <div
                    key={v.id}
                    className="border-l-4 border-red-400 pl-4 py-2"
                  >
                    <p className="font-medium">{v.violationType}</p>
                    {v.description && (
                      <p className="text-sm text-gray-700">{v.description}</p>
                    )}
                    <div className="flex gap-4 text-xs text-gray-600 mt-1">
                      {v.date && <span>Date: {v.date}</span>}
                      {v.disposition && (
                        <span>Disposition: {v.disposition}</span>
                      )}
                      {v.penalty && <span>Penalty: {v.penalty}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-bold mb-3">Contact Information</h3>
            <div className="relative">
              <div className="blur-sm select-none" aria-hidden="true">
                <p className="text-gray-700 mb-2">(512) 555-XXXX</p>
                <p className="text-gray-700">contact@example.com</p>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Link
                  href="/pricing"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Unlock Contact Info — $29/mo
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          {revenueData.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-bold mb-3">Revenue Summary</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">
                    Avg Monthly Revenue
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    $
                    {Math.round(
                      totalRevenue / revenueData.length
                    ).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Months Tracked</p>
                  <p className="text-lg font-semibold">
                    {revenueData.length}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Data Source */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 text-sm text-gray-600">
            <p className="font-medium text-gray-700 mb-1">Data Source</p>
            <p>
              Texas Alcoholic Beverage Commission (TABC) & Texas Comptroller
              Mixed Beverage Gross Receipts
            </p>
            <p className="mt-1 text-xs">
              Last synced:{" "}
              {license.lastSyncedAt
                ? new Date(license.lastSyncedAt).toLocaleDateString()
                : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: license.businessName,
            address: {
              "@type": "PostalAddress",
              streetAddress: license.address,
              addressLocality: license.city,
              addressRegion: license.state,
              postalCode: license.zip,
            },
            ...(license.latitude &&
              license.longitude && {
                geo: {
                  "@type": "GeoCoordinates",
                  latitude: license.latitude,
                  longitude: license.longitude,
                },
              }),
          }),
        }}
      />
    </div>
  );
}

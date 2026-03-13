import { db } from "@/db";
import { revenue } from "@/db/schema";
import { sql, desc, sum } from "drizzle-orm";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Top Revenue Bars & Restaurants in Texas",
  description: "See the highest-grossing bars, restaurants, and liquor establishments in Texas based on verified TABC Mixed Beverage Gross Receipts data.",
};

export const revalidate = 86400;

export default async function TopRevenuePage(): Promise<React.ReactElement> {
  const topCities = await db
    .select({
      city: revenue.city,
      totalRevenue: sum(revenue.totalReceipts),
      count: sql<number>`count(distinct ${revenue.businessName})`,
    })
    .from(revenue)
    .where(sql`${revenue.city} is not null AND ${revenue.city} != ''`)
    .groupBy(revenue.city)
    .orderBy(desc(sum(revenue.totalReceipts)))
    .limit(20);

  const topEstablishments = await db
    .select({
      businessName: revenue.businessName,
      city: revenue.city,
      totalRevenue: sum(revenue.totalReceipts),
    })
    .from(revenue)
    .where(sql`${revenue.businessName} is not null`)
    .groupBy(revenue.businessName, revenue.city)
    .orderBy(desc(sum(revenue.totalReceipts)))
    .limit(25);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-amber-600">Home</Link>{" / "}
        <span className="text-gray-900">Top Revenue</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">Top Revenue Bars & Restaurants in Texas</h1>
      <p className="text-gray-700 mb-8">
        Based on verified Mixed Beverage Gross Receipts from the Texas Comptroller
      </p>

      {/* Top Cities */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Top Cities by Total Revenue</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {topCities.map((c) => (
            <Link
              key={c.city}
              href={`/top-revenue/${encodeURIComponent((c.city || "").toLowerCase())}`}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:border-amber-500 hover:shadow-md transition-all"
            >
              <p className="font-semibold text-gray-900">{c.city}</p>
              <p className="text-lg font-bold text-amber-600">
                ${Number(c.totalRevenue || 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-600">{Number(c.count)} establishments</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Top Establishments */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Top Grossing Establishments</h2>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-500">#</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Establishment</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">City</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topEstablishments.map((e, i) => (
                <tr key={`${e.businessName}-${e.city}`} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-400">{i + 1}</td>
                  <td className="py-3 px-4 font-medium">{e.businessName}</td>
                  <td className="py-3 px-4 text-gray-700">{e.city}</td>
                  <td className="py-3 px-4 text-right font-semibold">
                    ${Number(e.totalRevenue || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-12 bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
        <h3 className="text-xl font-bold mb-2">Want the full revenue dataset?</h3>
        <p className="text-gray-700 mb-4">
          Pro subscribers get access to detailed monthly revenue reports for every establishment.
        </p>
        <Link href="/pricing" className="inline-block px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors">
          Upgrade to Pro — $29/mo
        </Link>
      </div>
    </div>
  );
}

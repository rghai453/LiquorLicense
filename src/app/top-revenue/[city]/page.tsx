import { db } from "@/db";
import { revenue } from "@/db/schema";
import { sql, desc, sum, ilike } from "drizzle-orm";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 86400;

interface TopRevenueCityProps {
  params: Promise<{ city: string }>;
}

export async function generateMetadata({ params }: TopRevenueCityProps): Promise<Metadata> {
  const { city } = await params;
  const cityName = decodeURIComponent(city).replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    title: `Top Revenue Bars & Restaurants in ${cityName}, TX`,
    description: `See the highest-grossing bars, restaurants, and liquor establishments in ${cityName}, Texas based on verified TABC revenue data.`,
  };
}

export default async function TopRevenueCityPage({ params }: TopRevenueCityProps): Promise<React.ReactElement> {
  const { city } = await params;
  const cityName = decodeURIComponent(city).replace(/\b\w/g, (c) => c.toUpperCase());

  const topEstablishments = await db
    .select({
      businessName: revenue.businessName,
      address: revenue.address,
      totalRevenue: sum(revenue.totalReceipts),
      liquorRevenue: sum(revenue.liquorReceipts),
      beerRevenue: sum(revenue.beerReceipts),
      wineRevenue: sum(revenue.wineReceipts),
    })
    .from(revenue)
    .where(ilike(revenue.city, cityName))
    .groupBy(revenue.businessName, revenue.address)
    .orderBy(desc(sum(revenue.totalReceipts)))
    .limit(50);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-amber-600">Home</Link>{" / "}
        <Link href="/top-revenue" className="hover:text-amber-600">Top Revenue</Link>{" / "}
        <span className="text-gray-900">{cityName}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">Top Revenue Bars & Restaurants in {cityName}, TX</h1>
      <p className="text-gray-700 mb-8">Ranked by total Mixed Beverage Gross Receipts</p>

      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-500">#</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Establishment</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Address</th>
              <th className="text-right py-3 px-4 font-medium text-gray-500">Total</th>
              <th className="text-right py-3 px-4 font-medium text-gray-500">Liquor</th>
              <th className="text-right py-3 px-4 font-medium text-gray-500">Beer</th>
              <th className="text-right py-3 px-4 font-medium text-gray-500">Wine</th>
            </tr>
          </thead>
          <tbody>
            {topEstablishments.map((e, i) => (
              <tr key={`${e.businessName}-${i}`} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-400">{i + 1}</td>
                <td className="py-3 px-4 font-medium">{e.businessName}</td>
                <td className="py-3 px-4 text-gray-700 text-xs">{e.address}</td>
                <td className="py-3 px-4 text-right font-semibold">${Number(e.totalRevenue || 0).toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-gray-700">${Number(e.liquorRevenue || 0).toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-gray-700">${Number(e.beerRevenue || 0).toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-gray-700">${Number(e.wineRevenue || 0).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {topEstablishments.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-600">
          <p>No revenue data available for {cityName} yet.</p>
        </div>
      )}
    </div>
  );
}

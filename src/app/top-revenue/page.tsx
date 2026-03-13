import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight, ArrowUpRight } from "lucide-react";
import {
  getTopRevenueCities,
  getTopRevenueEstablishments,
} from "@/db/queries";
import { AdSlot } from "@/components/ads/AdSlot";

export const metadata: Metadata = {
  title: "Top Revenue Bars & Restaurants in Texas",
  description:
    "See the highest-grossing bars, restaurants, and liquor establishments in Texas based on verified TABC Mixed Beverage Gross Receipts data.",
};

export const revalidate = 86400;

export default async function TopRevenuePage(): Promise<React.ReactElement> {
  const [topCities, topEstablishments] = await Promise.all([
    getTopRevenueCities(),
    getTopRevenueEstablishments(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-stone-400">
        <Link href="/" className="transition-colors hover:text-amber-600">Home</Link>
        <ChevronRight className="size-3" />
        <span className="font-medium text-stone-700">Top Revenue</span>
      </nav>

      <h1 className="text-3xl font-bold tracking-tight text-stone-900">
        Top Revenue Bars & Restaurants in Texas
      </h1>
      <p className="mt-1 text-sm text-stone-500 mb-10">
        Based on verified Mixed Beverage Gross Receipts from the Texas Comptroller
      </p>

      <section className="mb-14">
        <h2 className="text-lg font-semibold text-stone-900 mb-5">
          Top Cities by Total Revenue
        </h2>
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
          {topCities.map((c) => (
            <Link
              key={c.city}
              href={`/top-revenue/${encodeURIComponent((c.city || "").toLowerCase())}`}
              className="group"
            >
              <div className="rounded-xl border border-stone-200/80 bg-white p-4 transition-all duration-200 hover:border-amber-300/60 hover:shadow-md hover:shadow-amber-900/5">
                <div className="flex items-start justify-between">
                  <p className="text-sm font-semibold text-stone-800 group-hover:text-amber-700">
                    {c.city}
                  </p>
                  <ArrowUpRight className="size-3.5 text-stone-300 group-hover:text-amber-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
                <p className="mt-2 text-lg font-bold tabular-nums text-amber-600">
                  ${Number(c.totalRevenue || 0).toLocaleString()}
                </p>
                <p className="mt-0.5 text-xs text-stone-400">
                  {Number(c.count)} establishments
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <AdSlot slot="top-revenue-mid" format="horizontal" className="mb-14" />

      <section>
        <h2 className="text-lg font-semibold text-stone-900 mb-5">
          Top Grossing Establishments
        </h2>
        <div className="overflow-hidden rounded-xl border border-stone-200/80 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/50">
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-stone-400 w-12">#</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-stone-400">Establishment</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-stone-400">City</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-stone-400">Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topEstablishments.map((e, i) => (
                <tr
                  key={`${e.businessName}-${e.city}`}
                  className="border-b border-stone-50 transition-colors hover:bg-stone-50/50 last:border-0"
                >
                  <td className="px-4 py-3 text-sm tabular-nums text-stone-400">{i + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium text-stone-800">{e.businessName}</td>
                  <td className="px-4 py-3 text-sm text-stone-500">{e.city}</td>
                  <td className="px-4 py-3 text-right text-sm font-semibold tabular-nums text-stone-900">
                    ${Number(e.totalRevenue || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-14 rounded-xl border border-amber-200 bg-amber-50 px-6 py-8 text-center">
        <h3 className="text-xl font-bold text-stone-900">
          Need this data in a spreadsheet?
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-stone-600">
          Download complete license and revenue datasets as CSV files.
        </p>
        <Link
          href="/pricing"
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 px-6 text-sm font-semibold text-stone-900 shadow-sm transition-all hover:from-amber-300 hover:to-amber-400"
        >
          Browse Data Lists
        </Link>
      </div>
    </div>
  );
}

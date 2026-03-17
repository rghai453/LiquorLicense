import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight, ArrowUpRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { getLicensesByCity } from "@/db/queries";
import { AdSlot } from "@/components/ads/AdSlot";

export const revalidate = 86400;

interface CityPageProps {
  params: Promise<{ city: string }>;
}

export async function generateMetadata({
  params,
}: CityPageProps): Promise<Metadata> {
  const { city } = await params;
  const cityName = decodeURIComponent(city).replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    title: `Liquor Licenses in ${cityName}, TX`,
    description: `Browse all active liquor licenses in ${cityName}, Texas. View establishment details, revenue data, and TABC license info.`,
    alternates: { canonical: `/cities/${city}` },
  };
}

export default async function CityPage({
  params,
}: CityPageProps): Promise<React.ReactElement> {
  const { city } = await params;
  const cityName = decodeURIComponent(city).replace(/\b\w/g, (c) => c.toUpperCase());

  const { results, total, typeBreakdown } = await getLicensesByCity(cityName);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-stone-400">
        <Link href="/" className="transition-colors hover:text-amber-600">Home</Link>
        <ChevronRight className="size-3" />
        <Link href="/directory" className="transition-colors hover:text-amber-600">Directory</Link>
        <ChevronRight className="size-3" />
        <span className="font-medium text-stone-700">{cityName}</span>
      </nav>

      <h1 className="text-3xl font-bold tracking-tight text-stone-900">
        Liquor Licenses in {cityName}, TX
      </h1>
      <p className="mt-1 text-sm text-stone-500 mb-8">
        {total.toLocaleString()} active licenses
      </p>

      <div className="mb-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-stone-200/80 ring-1 ring-stone-200 lg:grid-cols-2">
        <div className="bg-white px-5 py-4">
          <p className="text-[11px] font-medium uppercase tracking-wider text-stone-400">Total Licenses</p>
          <p className="text-2xl font-bold tabular-nums text-stone-900">{total.toLocaleString()}</p>
        </div>
        <div className="bg-white px-5 py-4">
          <p className="text-[11px] font-medium uppercase tracking-wider text-stone-400">License Types</p>
          <p className="text-2xl font-bold tabular-nums text-stone-900">{typeBreakdown.length}</p>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-lg font-semibold text-stone-900 mb-4">License Types in {cityName}</h2>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {typeBreakdown.map((t) => (
            <Link
              key={t.type}
              href={`/directory?type=${encodeURIComponent(t.type)}&city=${encodeURIComponent(cityName)}`}
              className="group flex items-center justify-between rounded-xl border border-stone-200/80 bg-white px-4 py-3 transition-all hover:border-amber-300/60 hover:shadow-sm"
            >
              <span className="text-sm font-medium text-stone-700 group-hover:text-amber-700">{t.type}</span>
              <span className="text-xs tabular-nums text-stone-400">{t.count}</span>
            </Link>
          ))}
        </div>
      </div>

      <AdSlot slot="city-mid" format="horizontal" className="mb-10" />

      <h2 className="text-lg font-semibold text-stone-900 mb-4">Establishments</h2>
      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-3 mb-10">
        {results.map((lic) => (
          <Link key={lic.id} href={`/licenses/${lic.slug}`} className="group">
            <div className="h-full rounded-xl border border-stone-200/80 bg-white p-4 transition-all duration-200 hover:border-amber-300/60 hover:shadow-md hover:shadow-amber-900/5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-stone-800 truncate flex-1 group-hover:text-amber-700">{lic.businessName}</p>
                <ArrowUpRight className="size-3.5 shrink-0 text-stone-300 group-hover:text-amber-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <p className="mt-1.5 text-sm text-stone-500">{lic.address}</p>
              <div className="mt-3">
                <span className="inline-flex items-center rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-600">{lic.licenseType}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {total > 24 && (
        <div className="text-center">
          <Link
            href={`/directory?city=${encodeURIComponent(cityName)}`}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-stone-900 px-6 text-sm font-medium text-white transition-colors hover:bg-stone-800"
          >
            View All {total.toLocaleString()} Licenses
          </Link>
        </div>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `Liquor Licenses in ${cityName}, TX`,
            description: `Browse ${total} active liquor licenses in ${cityName}, Texas.`,
            url: `${process.env.NEXT_PUBLIC_APP_URL || "https://barbooktx.com"}/cities/${encodeURIComponent(city)}`,
            about: {
              "@type": "City",
              name: cityName,
              containedInPlace: {
                "@type": "State",
                name: "Texas",
              },
            },
          }),
        }}
      />
    </div>
  );
}

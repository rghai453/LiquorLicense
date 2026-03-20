import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight, ArrowUpRight } from "lucide-react";
import { getLicensesByZip } from "@/db/queries";
import { Pagination } from "@/components/directory/Pagination";
import { AdSlot } from "@/components/ads/AdSlot";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildCollectionPage, buildBreadcrumbList, BASE_URL } from "@/components/seo/schemas";

export const revalidate = 86400;

interface ZipPageProps {
  params: Promise<{ zip: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: ZipPageProps): Promise<Metadata> {
  const { zip } = await params;
  return {
    title: `Liquor Licenses in ZIP ${zip} — Texas`,
    description: `Browse all TABC liquor licenses in ZIP code ${zip}, Texas. View establishment details and license data.`,
    alternates: { canonical: `/zip/${zip}` },
  };
}

const PAGE_SIZE = 24;

export default async function ZipPage({ params, searchParams }: ZipPageProps): Promise<React.ReactElement> {
  const { zip } = await params;
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1", 10));
  const offset = (page - 1) * PAGE_SIZE;

  const { results, total } = await getLicensesByZip(zip, PAGE_SIZE, offset);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const cities = [...new Set(results.map((r) => r.city).filter(Boolean))];
  const counties = [...new Set(results.map((r) => r.county).filter(Boolean))];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-stone-400">
        <Link href="/" className="transition-colors hover:text-amber-600">Home</Link>
        <ChevronRight className="size-3" />
        <Link href="/directory" className="transition-colors hover:text-amber-600">Directory</Link>
        <ChevronRight className="size-3" />
        <span className="font-medium text-stone-700">ZIP {zip}</span>
      </nav>

      <h1 className="text-3xl font-bold tracking-tight text-stone-900">
        Liquor Licenses in ZIP {zip}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-500 mb-8">
        ZIP code {zip} in Texas contains {total.toLocaleString()} active liquor licenses.
        {cities.length > 0 && ` This area covers parts of ${cities.slice(0, 3).join(", ")}${cities.length > 3 ? ` and ${cities.length - 3} more cities` : ""}.`}
        {counties.length > 0 && ` Located in ${counties.slice(0, 2).join(" and ")} ${counties.length === 1 ? "County" : "Counties"}.`}
        {" "}Data is sourced from the Texas Alcoholic Beverage Commission, updated daily.
      </p>

      <AdSlot slot="zip-top" format="horizontal" className="mb-8" />

      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-3">
        {results.map((lic) => (
          <Link key={lic.id} href={`/licenses/${lic.slug}`} className="group">
            <div className="h-full rounded-xl border border-stone-200/80 bg-white p-4 transition-all duration-200 hover:border-amber-300/60 hover:shadow-md hover:shadow-amber-900/5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-stone-800 truncate flex-1 group-hover:text-amber-700">{lic.businessName}</p>
                <ArrowUpRight className="size-3.5 shrink-0 text-stone-300 group-hover:text-amber-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <p className="mt-1.5 text-sm text-stone-500">{lic.address}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="inline-flex items-center rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-600">{lic.licenseType}</span>
                <span className="text-xs text-stone-400">
                  {lic.city}{lic.county ? `, ${lic.county} Co.` : ""}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          basePath={`/zip/${zip}`}
          searchParams={{}}
        />
      </div>

      <JsonLd data={[
        buildCollectionPage({
          name: `Liquor Licenses in ZIP ${zip}`,
          description: `Browse ${total.toLocaleString()} active TABC liquor licenses in ZIP code ${zip}, Texas.`,
          url: `${BASE_URL}/zip/${zip}`,
        }),
        buildBreadcrumbList([
          { name: "Home", url: BASE_URL },
          { name: "Directory", url: `${BASE_URL}/directory` },
          { name: `ZIP ${zip}` },
        ]),
      ]} />
    </div>
  );
}

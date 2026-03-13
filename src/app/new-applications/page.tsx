import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { getNewApplications, getTotalLicenseCount } from "@/db/queries";

export const metadata: Metadata = {
  title: "New License Applications — Texas Liquor Licenses",
  description: "View recently filed TABC liquor license applications in Texas. New bars, restaurants, and package stores opening soon.",
};

export const revalidate = 3600;

export default async function NewApplicationsPage(): Promise<React.ReactElement> {
  const [results, total] = await Promise.all([
    getNewApplications(),
    getTotalLicenseCount(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-stone-400">
        <Link href="/" className="transition-colors hover:text-amber-600">Home</Link>
        <ChevronRight className="size-3" />
        <span className="font-medium text-stone-700">New Applications</span>
      </nav>

      <h1 className="text-3xl font-bold tracking-tight text-stone-900">
        New License Applications
      </h1>
      <p className="mt-1 text-sm text-stone-500 mb-6">
        Recently filed TABC liquor license applications in Texas
      </p>

      <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
        <p className="text-sm font-medium text-amber-900">
          Sales teams: New license applications mean new businesses that need
          supplies, insurance, POS systems, and more.
        </p>
        <Link
          href="/pricing"
          className="mt-1.5 inline-flex items-center gap-1 text-sm font-semibold text-amber-700 transition-colors hover:text-amber-900"
        >
          Pro: Get instant email alerts when new applications are filed
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-3">
        {results.map((lic) => (
          <Link key={lic.id} href={`/licenses/${lic.slug}`} className="group">
            <div className="h-full rounded-xl border border-stone-200/80 bg-white p-4 transition-all duration-200 hover:border-amber-300/60 hover:shadow-md hover:shadow-amber-900/5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-stone-800 truncate flex-1 group-hover:text-amber-700">{lic.businessName}</p>
                <ArrowUpRight className="size-3.5 shrink-0 text-stone-300 group-hover:text-amber-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <p className="mt-1.5 text-sm text-stone-500">{lic.address}</p>
              <p className="mt-1 text-xs text-stone-400">{lic.city}, TX</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-600">{lic.licenseType}</span>
                {lic.issueDate && (
                  <span className="text-[11px] text-stone-400">
                    Issued: {lic.issueDate}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

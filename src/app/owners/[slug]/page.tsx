import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight, ArrowUpRight } from "lucide-react";
import { getLicensesByOwner } from "@/db/queries";
import { AdSlot } from "@/components/ads/AdSlot";

export const revalidate = 86400;

interface OwnerPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: OwnerPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { ownerName, total } = await getLicensesByOwner(slug);
  const displayName = ownerName.replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    title: `${displayName} — Texas Liquor License Holder`,
    description: `View ${total} liquor license${total !== 1 ? "s" : ""} held by ${displayName} in Texas. Verified TABC public records.`,
    alternates: { canonical: `/owners/${slug}` },
  };
}

export default async function OwnerPage({
  params,
}: OwnerPageProps): Promise<React.ReactElement> {
  const { slug } = await params;
  const { results, total, ownerName } = await getLicensesByOwner(slug);
  const displayName = ownerName.replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-stone-400">
        <Link href="/" className="transition-colors hover:text-amber-600">
          Home
        </Link>
        <ChevronRight className="size-3" />
        <Link
          href="/directory"
          className="transition-colors hover:text-amber-600"
        >
          Directory
        </Link>
        <ChevronRight className="size-3" />
        <span className="font-medium text-stone-700">{displayName}</span>
      </nav>

      <h1 className="text-3xl font-bold tracking-tight text-stone-900">
        {displayName}
      </h1>
      <p className="mt-1 text-sm text-stone-500 mb-8">
        {total.toLocaleString()} liquor license
        {total !== 1 ? "s" : ""} in Texas
      </p>

      <AdSlot slot="owner-top" format="horizontal" className="mb-8" />

      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-3">
        {results.map((lic) => {
          const locationParts = [
            lic.city,
            lic.county ? `${lic.county} Co.` : null,
          ]
            .filter(Boolean)
            .join(", ");

          return (
            <Link
              key={lic.id}
              href={`/licenses/${lic.slug}`}
              className="group"
            >
              <div className="h-full rounded-xl border border-stone-200/80 bg-white p-4 transition-all duration-200 hover:border-amber-300/60 hover:shadow-md hover:shadow-amber-900/5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-stone-800 truncate flex-1 group-hover:text-amber-700">
                    {lic.businessName}
                  </p>
                  <ArrowUpRight className="size-3.5 shrink-0 text-stone-300 group-hover:text-amber-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
                <p className="mt-1.5 text-sm text-stone-500">{lic.address}</p>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-600">
                    {lic.licenseType}
                  </span>
                  {locationParts && (
                    <span className="text-xs text-stone-400">
                      {locationParts}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `${displayName} — Texas Liquor License Holder`,
            description: `${total} liquor licenses held by ${displayName} in Texas.`,
            url: `${process.env.NEXT_PUBLIC_APP_URL || "https://barbooktx.com"}/owners/${slug}`,
          }),
        }}
      />
    </div>
  );
}

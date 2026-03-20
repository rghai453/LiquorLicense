import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight, ArrowUpRight } from "lucide-react";
import { getNewApplications } from "@/db/queries";
import { Pagination } from "@/components/directory/Pagination";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildCollectionPage, buildBreadcrumbList, BASE_URL } from "@/components/seo/schemas";

interface NewApplicationsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ searchParams }: NewApplicationsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  return {
    title: "New License Applications — Texas Liquor Licenses",
    description: "View recently filed TABC liquor license applications in Texas. New bars, restaurants, and package stores opening soon.",
    alternates: { canonical: page > 1 ? `/new-applications?page=${page}` : "/new-applications" },
  };
}

export const revalidate = 3600;

const PAGE_SIZE = 24;

export default async function NewApplicationsPage({ searchParams }: NewApplicationsPageProps): Promise<React.ReactElement> {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const offset = (page - 1) * PAGE_SIZE;

  const { results, total } = await getNewApplications(PAGE_SIZE, offset);
  const totalPages = Math.ceil(total / PAGE_SIZE);

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
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-500 mb-6">
        New TABC liquor license applications signal upcoming bars, restaurants, and retail
        establishments across Texas. Applications typically take 45 to 60 days for TABC to
        process, depending on the license type and whether a public hearing is required. This
        page lists {total.toLocaleString()} recently issued licenses, sorted by issue date.
        Data is sourced from TABC public records and updated daily.
      </p>

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

      <div className="mt-10">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          basePath="/new-applications"
          searchParams={{}}
        />
      </div>

      <JsonLd data={[
        buildCollectionPage({
          name: "New TABC License Applications",
          description: `Browse ${total.toLocaleString()} recently filed liquor license applications in Texas.`,
          url: `${BASE_URL}/new-applications`,
        }),
        buildBreadcrumbList([
          { name: "Home", url: BASE_URL },
          { name: "New Applications" },
        ]),
      ]} />
    </div>
  );
}

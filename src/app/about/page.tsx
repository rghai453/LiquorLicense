import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Database, Shield, Zap } from "lucide-react";
import { getHomeStats } from "@/db/queries";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildDataset, buildBreadcrumbList, BASE_URL } from "@/components/seo/schemas";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "About — Data Sources, Methodology & Mission",
  description:
    "BarBook Texas is a public data intelligence platform that aggregates and organizes Texas liquor license data from TABC and the Texas Comptroller. Learn about our data, methodology, and mission.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage(): Promise<React.ReactElement> {
  const stats = await getHomeStats();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <nav className="mb-8 flex items-center gap-1.5 text-sm text-stone-400">
        <Link href="/" className="transition-colors hover:text-amber-600">
          Home
        </Link>
        <ChevronRight className="size-3" />
        <span className="font-medium text-stone-700">About</span>
      </nav>

      <h1 className="text-4xl font-bold tracking-tight text-stone-900">
        About BarBook Texas
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-stone-600">
        BarBook Texas is a public data intelligence platform that makes Texas
        liquor license information accessible, searchable, and useful. We
        aggregate verified data from the Texas Alcoholic Beverage Commission
        (TABC) and the Texas Comptroller&apos;s Mixed Beverage Gross Receipts
        reports to provide the most comprehensive view of the state&apos;s
        licensed alcohol industry.
      </p>

      <h2 className="mt-12 text-2xl font-bold tracking-tight text-stone-900">
        Our Mission
      </h2>
      <p className="mt-3 text-stone-600 leading-relaxed">
        Texas has over {stats.totalLicenses.toLocaleString()} active liquor
        licenses across {stats.totalCities.toLocaleString()} cities and{" "}
        {stats.totalCounties.toLocaleString()} counties. This data is publicly
        available but scattered across multiple government databases, making it
        difficult to search, analyze, or download in a usable format. BarBook
        Texas solves this by normalizing the data into a single searchable
        platform with revenue analytics, violation tracking, and exportable
        datasets.
      </p>

      <h2 className="mt-12 text-2xl font-bold tracking-tight text-stone-900">
        How It Works
      </h2>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[
          {
            icon: Database,
            title: "Verified Data Sources",
            desc: "All license data comes directly from TABC public records. Revenue figures are sourced from Texas Comptroller filings. We never use scraped or third-party data.",
          },
          {
            icon: Zap,
            title: "Daily Sync Pipeline",
            desc: "Our automated data pipeline syncs with TABC daily to capture new license applications, status changes, and enforcement actions as they are published.",
          },
          {
            icon: Shield,
            title: "Data Accuracy",
            desc: "Records are deduplicated, normalized, and validated against the official TABC database. License numbers serve as the primary key for matching across data sources.",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title}>
              <div className="flex size-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 ring-1 ring-amber-200/50">
                <Icon className="size-5" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-stone-900">
                {item.title}
              </h3>
              <p className="mt-1.5 text-sm text-stone-500 leading-relaxed">
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>

      <h2 className="mt-12 text-2xl font-bold tracking-tight text-stone-900">
        Who Uses BarBook Texas
      </h2>
      <ul className="mt-4 space-y-3 text-stone-600">
        <li className="flex gap-2">
          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-500" />
          <span>
            <strong className="text-stone-900">Sales teams</strong> targeting bars,
            restaurants, and liquor stores for B2B products and services.
          </span>
        </li>
        <li className="flex gap-2">
          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-500" />
          <span>
            <strong className="text-stone-900">Real estate professionals</strong>{" "}
            researching commercial properties and market activity.
          </span>
        </li>
        <li className="flex gap-2">
          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-500" />
          <span>
            <strong className="text-stone-900">Investors and analysts</strong>{" "}
            evaluating revenue data and market trends in the Texas hospitality
            sector.
          </span>
        </li>
        <li className="flex gap-2">
          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-500" />
          <span>
            <strong className="text-stone-900">Journalists and researchers</strong>{" "}
            covering the Texas alcohol industry, enforcement actions, and
            regulatory trends.
          </span>
        </li>
      </ul>

      <h2 className="mt-12 text-2xl font-bold tracking-tight text-stone-900">
        Contact
      </h2>
      <p className="mt-3 text-stone-600 leading-relaxed">
        For questions about our data, custom dataset requests, or partnership
        inquiries, contact us at{" "}
        <a
          href="mailto:data@barbooktx.com"
          className="font-medium text-amber-600 hover:text-amber-700"
        >
          data@barbooktx.com
        </a>
        .
      </p>

      <div className="mt-12 rounded-xl border border-stone-200/80 bg-stone-50/50 p-6">
        <p className="text-xs text-stone-400 leading-relaxed">
          BarBook Texas is not affiliated with or endorsed by the Texas Alcoholic
          Beverage Commission (TABC) or the Texas Comptroller of Public Accounts.
          All data presented is sourced from publicly available government records.
          While we strive for accuracy, users should verify critical information
          directly with the relevant government agency.
        </p>
      </div>

      <JsonLd data={[
        {
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "About BarBook Texas",
          description:
            "BarBook Texas aggregates and organizes Texas liquor license data from TABC and the Texas Comptroller.",
          url: `${BASE_URL}/about`,
          mainEntity: {
            "@type": "Organization",
            name: "BarBook Texas",
            url: BASE_URL,
            email: "data@barbooktx.com",
            description:
              "Texas liquor license intelligence platform providing searchable TABC data, revenue reports, and violations.",
          },
        },
        buildDataset({
          name: "Texas Liquor License Database",
          description: "Comprehensive database of Texas TABC liquor licenses including business details, license types, revenue data, and violations.",
          url: BASE_URL,
          distribution: { encodingFormat: "text/csv", contentUrl: `${BASE_URL}/pricing` },
          temporalCoverage: "2020/..",
          spatialCoverage: "Texas, United States",
        }),
        buildBreadcrumbList([
          { name: "Home", url: BASE_URL },
          { name: "About" },
        ]),
      ]} />
    </div>
  );
}

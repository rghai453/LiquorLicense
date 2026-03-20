import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "BarBook Texas terms of service. Usage terms for our Texas liquor license data platform and data list purchases.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage(): React.ReactElement {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <nav className="mb-8 flex items-center gap-1.5 text-sm text-stone-400">
        <Link href="/" className="transition-colors hover:text-amber-600">
          Home
        </Link>
        <ChevronRight className="size-3" />
        <span className="font-medium text-stone-700">Terms of Service</span>
      </nav>

      <h1 className="text-4xl font-bold tracking-tight text-stone-900">
        Terms of Service
      </h1>
      <p className="mt-2 text-sm text-stone-400">
        Last updated: March 20, 2026
      </p>

      <div className="mt-8 space-y-8 text-stone-600 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-stone-900">
            Acceptance of Terms
          </h2>
          <p className="mt-3">
            By accessing and using BarBook Texas (barbooktx.com), you agree to be
            bound by these Terms of Service. If you do not agree to these terms,
            do not use the service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-900">
            Description of Service
          </h2>
          <p className="mt-3">
            BarBook Texas provides a searchable database of Texas liquor license
            information sourced from publicly available government records. The
            service includes free browsing of license data, revenue reports, and
            violation records, as well as paid CSV data list downloads.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-900">
            Data Accuracy
          </h2>
          <p className="mt-3">
            While we make every effort to ensure data accuracy by sourcing
            directly from the Texas Alcoholic Beverage Commission (TABC) and the
            Texas Comptroller, we make no warranties about the completeness,
            accuracy, or timeliness of the information provided. Government source
            data may contain errors or lag behind real-time changes. Users should
            verify critical information directly with the relevant government
            agency.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-900">
            Data List Purchases
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              All data list purchases are one-time transactions processed via
              Stripe.
            </li>
            <li>
              Data lists are delivered instantly as CSV file downloads after
              payment.
            </li>
            <li>
              Due to the digital nature of the product, all sales are final. We do
              not offer refunds on data list purchases.
            </li>
            <li>
              Purchased data may be used for your own business purposes. You may
              not resell the raw data or republish it as a competing data product.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-900">
            Acceptable Use
          </h2>
          <p className="mt-3">You agree not to:</p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              Scrape, crawl, or systematically download data from the website
              beyond normal browsing usage.
            </li>
            <li>
              Use the service for any unlawful purpose or in violation of any
              applicable laws.
            </li>
            <li>
              Attempt to interfere with or disrupt the service or its
              infrastructure.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-900">
            Limitation of Liability
          </h2>
          <p className="mt-3">
            BarBook Texas is provided &quot;as is&quot; without warranties of any
            kind. We are not liable for any damages arising from your use of the
            service, reliance on data accuracy, or inability to access the
            service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-900">
            Changes to Terms
          </h2>
          <p className="mt-3">
            We reserve the right to update these terms at any time. Continued use
            of the service after changes constitutes acceptance of the revised
            terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-stone-900">Contact</h2>
          <p className="mt-3">
            Questions about these terms? Contact us at{" "}
            <a
              href="mailto:data@barbooktx.com"
              className="font-medium text-amber-600 hover:text-amber-700"
            >
              data@barbooktx.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}

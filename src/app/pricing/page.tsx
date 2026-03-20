import type { Metadata } from "next";
import { Check, CheckCircle, FileSpreadsheet } from "lucide-react";
import { CheckoutButton } from "@/components/billing/CheckoutButton";
import { DownloadTrigger } from "@/components/billing/DownloadTrigger";
import { stripe } from "@/lib/stripe";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildProduct, buildFAQPage, BASE_URL } from "@/components/seo/schemas";

export const metadata: Metadata = {
  title: "Texas Liquor License Data Lists — CSV Downloads",
  description:
    "Download verified Texas liquor license datasets as CSV. Active bar licenses, new applications, full state database, and more.",
  alternates: { canonical: "/pricing" },
};

interface PricingPageProps {
  searchParams: Promise<{ success?: string; session_id?: string }>;
}

const DATA_LISTS = [
  {
    name: "New Applications This Month",
    desc: "Every new license filed in the last 30 days — one CSV",
    price: "$49",
    priceId: process.env.STRIPE_PRICE_NEW_APPLICATIONS!,
    records: "500+",
    features: [
      "One bulk download, no browsing required",
      "Ready for Excel, Google Sheets, or any CRM",
      "Great for sales prospecting new venues",
      "Updated with the latest TABC filings",
    ],
  },
  {
    name: "All Active Bar Licenses",
    desc: "Every active bar & mixed beverage license in one spreadsheet",
    price: "$99",
    priceId: process.env.STRIPE_PRICE_ACTIVE_BARS!,
    records: "15,000+",
    popular: true,
    features: [
      "15,000+ records in one download",
      "Import directly into your CRM or mailing list",
      "Filter & sort by city, county, owner, type",
      "Hours of manual research done in seconds",
    ],
  },
  {
    name: "Full State License Database",
    desc: "The complete Texas license database as a single CSV file",
    price: "$499",
    priceId: process.env.STRIPE_PRICE_FULL_DATABASE!,
    records: "120,000+",
    features: [
      "Every license type — bars, retail, wholesale",
      "120,000+ records, all 14 data fields",
      "Revenue data included where available",
      "The entire dataset for analytics & research",
    ],
  },
];

const FAQS = [
  {
    q: "Where does the data come from?",
    a: "All data is sourced from the Texas Alcoholic Beverage Commission (TABC) and the Texas Comptroller's Mixed Beverage Gross Receipts reports. It's 100% verified public record data.",
  },
  {
    q: "How often is the data updated?",
    a: "Our data pipeline syncs with TABC daily. Revenue data is published monthly by the Texas Comptroller. Data lists reflect the most recent sync.",
  },
  {
    q: "What format are the data lists?",
    a: "All data lists are delivered as CSV files that open in Excel, Google Sheets, or any data tool.",
  },
  {
    q: "Can I get a refund?",
    a: "Since data lists are delivered instantly as digital downloads, we don't offer refunds. Contact us if you have any issues with your purchase.",
  },
];

export default async function PricingPage({
  searchParams,
}: PricingPageProps): Promise<React.ReactElement> {
  const params = await searchParams;
  const showSuccess = params.success === "true";

  let listSlug: string | null = null;
  if (showSuccess && params.session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(params.session_id);
      if (session.payment_status === "paid") {
        listSlug = session.metadata?.list_slug ?? null;
      }
    } catch {
      // Invalid session — just show success without download
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      {showSuccess && (
        <div className="mb-8 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4">
          <CheckCircle className="size-5 shrink-0 text-green-600" />
          <div>
            <p className="text-sm font-semibold text-green-900">
              Payment successful — your download should start automatically.
            </p>
            <p className="text-sm text-green-700">
              If it didn&apos;t,{" "}
              {listSlug && params.session_id ? (
                <a
                  href={`/api/data-lists/${listSlug}/download?session_id=${params.session_id}`}
                  className="font-semibold underline"
                >
                  click here to download
                </a>
              ) : (
                "contact data@barbooktx.com"
              )}
            </p>
          </div>
          {listSlug && params.session_id && (
            <DownloadTrigger sessionId={params.session_id} listSlug={listSlug} />
          )}
        </div>
      )}

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-stone-900">
          Texas Liquor License Data Lists
        </h1>
        <p className="mt-3 text-lg text-stone-500">
          Download verified datasets as CSV. One-time purchase, instant
          delivery.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {DATA_LISTS.map((list) => (
          <div
            key={list.name}
            className={`relative flex flex-col rounded-xl border bg-white p-6 shadow-sm ${
              list.popular
                ? "border-2 border-amber-400 shadow-md"
                : "border-stone-200/80"
            }`}
          >
            {list.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-amber-500 px-4 py-1 text-xs font-semibold text-white">
                  Most Popular
                </span>
              </div>
            )}
            <div>
              <h2 className="text-lg font-bold text-stone-900">{list.name}</h2>
              <p className="mt-1 text-sm text-stone-500">{list.desc}</p>
              <p className="mt-1 text-xs text-stone-400">
                {list.records} records
              </p>
            </div>

            <div className="mt-5">
              <span className="text-4xl font-bold text-stone-900">
                {list.price}
              </span>
              <span className="ml-1 text-sm text-stone-400">one-time</span>
            </div>

            <ul className="mt-6 space-y-2.5 flex-1">
              {list.features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2.5 text-sm text-stone-600"
                >
                  <Check className="size-4 shrink-0 text-amber-600 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <CheckoutButton priceId={list.priceId} label={`Buy — ${list.price}`} fullWidth />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-xl border border-stone-200/80 bg-stone-50/50 p-8 text-center">
        <FileSpreadsheet className="size-8 text-amber-600 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-stone-900">
          Need a custom dataset?
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-stone-500">
          We can build custom data exports filtered by city, county, license
          type, revenue range, and more.
        </p>
        <a
          href="mailto:data@barbooktx.com"
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl border border-stone-200 bg-white px-6 text-sm font-semibold text-stone-700 shadow-sm transition-colors hover:bg-stone-50"
        >
          Contact Us
        </a>
      </div>

      <div className="mt-16 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold tracking-tight text-stone-900 mb-8 text-center">
          FAQ
        </h2>
        <div className="space-y-4">
          {FAQS.map((faq) => (
            <div
              key={faq.q}
              className="rounded-xl border border-stone-200/80 bg-white p-6"
            >
              <h3 className="font-semibold text-sm text-stone-900">{faq.q}</h3>
              <p className="text-sm text-stone-500 mt-2">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      <JsonLd data={[
        buildProduct({
          name: "New Applications This Month",
          description: "Every new TABC license filed in the last 30 days as a CSV download.",
          price: "49.00",
          url: `${BASE_URL}/pricing`,
        }),
        buildProduct({
          name: "All Active Bar Licenses",
          description: "Every active bar and mixed beverage license in Texas as a CSV download.",
          price: "99.00",
          url: `${BASE_URL}/pricing`,
        }),
        buildProduct({
          name: "Full State License Database",
          description: "The complete Texas TABC license database with all license types as a CSV download.",
          price: "499.00",
          url: `${BASE_URL}/pricing`,
        }),
        buildFAQPage(FAQS.map((faq) => ({ question: faq.q, answer: faq.a }))),
      ]} />
    </div>
  );
}

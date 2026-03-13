import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — LiquorScope",
  description:
    "Upgrade to LiquorScope Pro for unlimited contact reveals, revenue data, email alerts, saved searches, and CSV exports. Starting at $29/mo.",
};

const FREE_FEATURES = [
  "Browse all 120,000+ licenses",
  "View establishment details",
  "Search & filter directory",
  "City, county, ZIP pages",
  "Violation history",
];

const PRO_FEATURES = [
  "Everything in Free",
  "Unlimited contact info reveals",
  "Monthly revenue data access",
  "Saved searches",
  "Email alerts (daily/weekly)",
  "CSV data exports",
  "Statewide coverage",
  "Priority support",
];

export default function PricingPage(): React.ReactElement {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-gray-700">
          Start free. Upgrade when you need contact info, revenue data, and
          alerts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {/* Free Tier */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Free</h2>
          <p className="text-gray-600 mb-4">Browse & search</p>
          <div className="mb-6">
            <span className="text-4xl font-bold text-gray-900">$0</span>
            <span className="text-gray-600">/mo</span>
          </div>
          <ul className="space-y-3 mb-8">
            {FREE_FEATURES.map((f) => (
              <li
                key={f}
                className="flex items-start gap-2 text-sm text-gray-800"
              >
                <svg
                  className="w-5 h-5 text-green-600 shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {f}
              </li>
            ))}
          </ul>
          <div className="text-center">
            <span className="inline-block px-6 py-2 border border-gray-300 text-gray-600 rounded-lg font-medium">
              Current Plan
            </span>
          </div>
        </div>

        {/* Pro Tier */}
        <div className="bg-white rounded-xl border-2 border-amber-500 p-8 relative shadow-md">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
            Most Popular
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Pro</h2>
          <p className="text-gray-600 mb-4">Full access</p>
          <div className="mb-6">
            <span className="text-4xl font-bold text-gray-900">$29</span>
            <span className="text-gray-600">/mo</span>
          </div>
          <ul className="space-y-3 mb-8">
            {PRO_FEATURES.map((f) => (
              <li
                key={f}
                className="flex items-start gap-2 text-sm text-gray-800"
              >
                <svg
                  className="w-5 h-5 text-amber-600 shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {f}
              </li>
            ))}
          </ul>
          <div className="text-center">
            <button className="w-full px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors">
              Upgrade to Pro
            </button>
          </div>
        </div>
      </div>

      {/* Data Lists */}
      <div className="mt-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            One-Time Data Lists
          </h2>
          <p className="text-gray-700">
            Need a specific dataset? Purchase and download instantly as CSV.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            {
              name: "All Active Bar Licenses",
              desc: "Every active bar license in Texas with full details",
              price: "$99",
              records: "15,000+",
            },
            {
              name: "New Applications This Month",
              desc: "License applications filed in the last 30 days",
              price: "$49",
              records: "500+",
            },
            {
              name: "Full State License Database",
              desc: "Complete TABC license database with all fields",
              price: "$499",
              records: "120,000+",
            },
          ].map((list) => (
            <div
              key={list.name}
              className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
            >
              <h3 className="font-bold text-gray-900 mb-1">{list.name}</h3>
              <p className="text-sm text-gray-700 mb-3">{list.desc}</p>
              <p className="text-xs text-gray-500 mb-4">
                {list.records} records
              </p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">
                  {list.price}
                </span>
                <button className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors">
                  Buy CSV
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-16 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          FAQ
        </h2>
        <div className="space-y-4">
          {[
            {
              q: "Where does the data come from?",
              a: "All data is sourced from the Texas Alcoholic Beverage Commission (TABC) and the Texas Comptroller's Mixed Beverage Gross Receipts reports. It's 100% verified public record data.",
            },
            {
              q: "How often is the data updated?",
              a: "Our data pipeline syncs with TABC daily. Revenue data is published monthly by the Texas Comptroller.",
            },
            {
              q: "Can I cancel anytime?",
              a: "Yes — Pro subscriptions can be cancelled anytime from your dashboard. No long-term contracts.",
            },
            {
              q: "What format are the data lists?",
              a: "All data lists are delivered as CSV files that open in Excel, Google Sheets, or any data tool.",
            },
          ].map((faq) => (
            <div
              key={faq.q}
              className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm"
            >
              <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
              <p className="text-sm text-gray-700">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface PricingTableProps {
  currentTier?: "free" | "pro";
}

interface PlanFeature {
  text: string;
  included: boolean;
}

const FREE_FEATURES: PlanFeature[] = [
  { text: "Browse all licenses", included: true },
  { text: "View establishment details", included: true },
  { text: "Search & filter", included: true },
  { text: "Contact info reveals", included: false },
  { text: "Saved searches", included: false },
  { text: "Email alerts", included: false },
  { text: "CSV exports", included: false },
  { text: "Revenue data access", included: false },
];

const PRO_FEATURES: PlanFeature[] = [
  { text: "Browse all licenses", included: true },
  { text: "View establishment details", included: true },
  { text: "Search & filter", included: true },
  { text: "Contact info reveals", included: true },
  { text: "Saved searches", included: true },
  { text: "Email alerts", included: true },
  { text: "CSV exports", included: true },
  { text: "Revenue data access", included: true },
];

function FeatureRow({ feature }: { feature: PlanFeature }): React.ReactElement {
  return (
    <li className="flex items-center gap-2 py-1.5">
      {feature.included ? (
        <svg
          className="h-4 w-4 shrink-0 text-green-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m4.5 12.75 6 6 9-13.5"
          />
        </svg>
      ) : (
        <svg
          className="h-4 w-4 shrink-0 text-gray-300"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18 18 6M6 6l12 12"
          />
        </svg>
      )}
      <span
        className={`text-sm ${feature.included ? "text-gray-700" : "text-gray-400"}`}
      >
        {feature.text}
      </span>
    </li>
  );
}

export function PricingTable({
  currentTier = "free",
}: PricingTableProps): React.ReactElement {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Free Tier */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Free</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started with basic license browsing
        </p>
        <p className="mt-4">
          <span className="text-3xl font-bold text-gray-900">$0</span>
          <span className="text-sm text-gray-500">/mo</span>
        </p>

        <ul className="mt-6 space-y-0">
          {FREE_FEATURES.map((feature) => (
            <FeatureRow key={feature.text} feature={feature} />
          ))}
        </ul>

        <button
          type="button"
          disabled={currentTier === "free"}
          className={`mt-6 w-full rounded-md px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors ${
            currentTier === "free"
              ? "cursor-default border border-gray-300 bg-gray-50 text-gray-500"
              : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          {currentTier === "free" ? "Current Plan" : "Downgrade"}
        </button>
      </div>

      {/* Pro Tier */}
      <div className="rounded-lg border-2 border-amber-400 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">Pro</h3>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
            Popular
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Full access to all license intelligence
        </p>
        <p className="mt-4">
          <span className="text-3xl font-bold text-gray-900">$29</span>
          <span className="text-sm text-gray-500">/mo</span>
        </p>

        <ul className="mt-6 space-y-0">
          {PRO_FEATURES.map((feature) => (
            <FeatureRow key={feature.text} feature={feature} />
          ))}
        </ul>

        <button
          type="button"
          disabled={currentTier === "pro"}
          className={`mt-6 w-full rounded-md px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors ${
            currentTier === "pro"
              ? "cursor-default border border-amber-300 bg-amber-50 text-amber-700"
              : "bg-amber-500 text-white hover:bg-amber-600"
          }`}
        >
          {currentTier === "pro" ? "Current Plan" : "Upgrade to Pro"}
        </button>
      </div>
    </div>
  );
}

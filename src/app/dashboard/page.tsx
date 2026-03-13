import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage(): React.ReactElement {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
        <h2 className="font-bold text-amber-800 mb-2">Neon Auth Required</h2>
        <p className="text-sm text-amber-700">
          Authentication will be powered by Neon Auth. Once configured, you'll
          be able to manage saved searches, alerts, and billing here.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/dashboard/saved-searches"
          className="bg-white rounded-lg border border-gray-200 p-6 hover:border-amber-500 transition-colors"
        >
          <h3 className="font-bold mb-2">Saved Searches</h3>
          <p className="text-sm text-gray-700">
            Save and re-run your favorite search filters.
          </p>
        </Link>
        <Link
          href="/dashboard/alerts"
          className="bg-white rounded-lg border border-gray-200 p-6 hover:border-amber-500 transition-colors"
        >
          <h3 className="font-bold mb-2">Email Alerts</h3>
          <p className="text-sm text-gray-700">
            Get notified when new licenses match your criteria.
          </p>
        </Link>
        <Link
          href="/dashboard/billing"
          className="bg-white rounded-lg border border-gray-200 p-6 hover:border-amber-500 transition-colors"
        >
          <h3 className="font-bold mb-2">Billing</h3>
          <p className="text-sm text-gray-700">
            Manage your Pro subscription and payment method.
          </p>
        </Link>
      </div>
    </div>
  );
}

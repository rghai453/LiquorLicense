import type React from "react";
import Link from "next/link";
import type { License } from "@/types";

interface EntityCardProps {
  license: License;
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  suspended: "bg-yellow-100 text-yellow-800",
  expired: "bg-gray-100 text-gray-800",
  revoked: "bg-red-100 text-red-800",
};

export function EntityCard({ license }: EntityCardProps): React.ReactElement {
  const statusClass =
    STATUS_STYLES[license.status.toLowerCase()] ??
    "bg-gray-100 text-gray-800";

  const showDba =
    license.dba && license.dba.toLowerCase() !== license.businessName.toLowerCase();

  const locationParts = [license.city, license.county ? `${license.county} County` : null]
    .filter(Boolean)
    .join(", ");

  return (
    <Link
      href={`/licenses/${license.slug}`}
      className="group block rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-amber-300 hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-gray-900 group-hover:text-amber-700">
          {license.businessName}
        </h3>
        <span
          className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusClass}`}
        >
          {license.status}
        </span>
      </div>

      {showDba && (
        <p className="mb-2 text-sm text-gray-500">
          DBA: {license.dba}
        </p>
      )}

      <span className="mb-3 inline-block rounded bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
        {license.licenseType}
      </span>

      {license.address && (
        <p className="mt-2 text-sm text-gray-600">{license.address}</p>
      )}

      {locationParts && (
        <p className="mt-1 text-sm text-gray-500">{locationParts}</p>
      )}
    </Link>
  );
}

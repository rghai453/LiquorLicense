import type React from "react";
import type { License } from "@/types";
import { EntityCard } from "./EntityCard";

interface EntityGridProps {
  licenses: License[];
}

export function EntityGrid({ licenses }: EntityGridProps): React.ReactElement {
  if (licenses.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white px-6 py-12 text-center">
        <p className="text-gray-500">
          No licenses found matching your criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {licenses.map((license) => (
        <EntityCard key={license.id} license={license} />
      ))}
    </div>
  );
}

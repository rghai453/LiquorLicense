"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";

const LICENSE_TYPES = [
  "Mixed Beverage",
  "Beer & Wine",
  "Package Store",
  "Brewpub",
  "Winery",
  "Distillery",
  "Caterer",
  "Private Club",
] as const;

const STATUSES = ["Active", "Suspended", "Expired", "Revoked"] as const;

export function FilterPanel(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const currentType = searchParams.get("licenseType") ?? "";
  const currentStatus = searchParams.get("status") ?? "";
  const currentCity = searchParams.get("city") ?? "";
  const currentCounty = searchParams.get("county") ?? "";

  const updateParam = (key: string, value: string): void => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  const clearFilters = (): void => {
    const params = new URLSearchParams();
    const q = searchParams.get("q");
    if (q) {
      params.set("q", q);
    }
    router.push(`?${params.toString()}`);
  };

  const hasFilters = currentType || currentStatus || currentCity || currentCounty;

  const filterContent = (
    <div className="space-y-5">
      <div>
        <label
          htmlFor="licenseType"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          License Type
        </label>
        <select
          id="licenseType"
          value={currentType}
          onChange={(e) => updateParam("licenseType", e.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
        >
          <option value="">All Types</option>
          {LICENSE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="status"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Status
        </label>
        <select
          id="status"
          value={currentStatus}
          onChange={(e) => updateParam("status", e.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="city"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          City
        </label>
        <input
          id="city"
          type="text"
          value={currentCity}
          onChange={(e) => updateParam("city", e.target.value)}
          placeholder="e.g. Austin"
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
        />
      </div>

      <div>
        <label
          htmlFor="county"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          County
        </label>
        <input
          id="county"
          type="text"
          value={currentCounty}
          onChange={(e) => updateParam("county", e.target.value)}
          placeholder="e.g. Travis"
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
        />
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
        >
          Clear Filters
        </button>
      )}
    </div>
  );

  return (
    <aside>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm md:hidden"
      >
        <span>Filters{hasFilters ? " (active)" : ""}</span>
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
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
            d="m19.5 8.25-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>

      <div className={`mt-3 md:mt-0 ${isOpen ? "block" : "hidden"} md:block`}>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Filters
          </h3>
          {filterContent}
        </div>
      </div>
    </aside>
  );
}

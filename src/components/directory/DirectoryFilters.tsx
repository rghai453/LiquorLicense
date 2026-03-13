"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LICENSE_TYPES = [
  "Mixed Beverage",
  "Beer & Wine",
  "Package Store",
  "Brewpub",
  "Manufacturer",
  "Wholesaler",
] as const;

const STATUSES = ["active", "suspended", "expired", "revoked"] as const;

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  suspended: "Suspended",
  expired: "Expired",
  revoked: "Revoked",
};

export function DirectoryFilters(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentType = searchParams.get("type") ?? "";
  const currentStatus = searchParams.get("status") ?? "";
  const currentCity = searchParams.get("city") ?? "";

  const hasFilters = currentType || currentStatus || currentCity || query;

  const pushParams = useCallback(
    (updates: Record<string, string>): void => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      params.delete("page");
      router.push(`/directory?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleSearch = (value: string): void => {
    setQuery(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      pushParams({ q: value.trim() });
    }, 300);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    pushParams({ q: query.trim() });
  };

  const clearAll = (): void => {
    setQuery("");
    router.push("/directory");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by business name..."
          className="pl-8 h-9"
        />
      </div>

      <Select
        value={currentType}
        onValueChange={(val) => pushParams({ type: val === "__all__" || !val ? "" : val })}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All Types</SelectItem>
          {LICENSE_TYPES.map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentStatus}
        onValueChange={(val) => pushParams({ status: val === "__all__" || !val ? "" : val })}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All Statuses</SelectItem>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_LABELS[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="text"
        name="city"
        value={currentCity}
        onChange={(e) => pushParams({ city: e.target.value })}
        placeholder="City"
        className="w-28 h-9"
      />

      <Button type="submit" size="default">
        Search
      </Button>

      {hasFilters && (
        <Button type="button" variant="ghost" size="default" onClick={clearAll}>
          <X className="size-4" />
          Clear
        </Button>
      )}
    </form>
  );
}

import type React from "react";
import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams: Record<string, string>;
}

function buildHref(
  basePath: string,
  searchParams: Record<string, string>,
  page: number
): string {
  const params = new URLSearchParams(searchParams);
  if (page > 1) {
    params.set("page", String(page));
  } else {
    params.delete("page");
  }
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis")[] = [1];

  if (current > 3) {
    pages.push("ellipsis");
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push("ellipsis");
  }

  pages.push(total);

  return pages;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  searchParams,
}: PaginationProps): React.ReactElement | null {
  if (totalPages <= 1) {
    return null;
  }

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1">
      {currentPage > 1 ? (
        <Link
          href={buildHref(basePath, searchParams, currentPage - 1)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
        >
          Previous
        </Link>
      ) : (
        <span className="cursor-not-allowed rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-400">
          Previous
        </span>
      )}

      {pages.map((page, index) => {
        if (page === "ellipsis") {
          return (
            <span
              key={`ellipsis-${index}`}
              className="px-2 py-2 text-sm text-gray-400"
            >
              ...
            </span>
          );
        }

        const isActive = page === currentPage;
        return (
          <Link
            key={page}
            href={buildHref(basePath, searchParams, page)}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "border border-amber-500 bg-amber-500 text-white shadow-sm"
                : "border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            {page}
          </Link>
        );
      })}

      {currentPage < totalPages ? (
        <Link
          href={buildHref(basePath, searchParams, currentPage + 1)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
        >
          Next
        </Link>
      ) : (
        <span className="cursor-not-allowed rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-400">
          Next
        </span>
      )}
    </nav>
  );
}

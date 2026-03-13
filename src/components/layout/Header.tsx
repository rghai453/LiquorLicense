"use client";

import Link from "next/link";
import { useState, type ReactElement } from "react";
import { Menu, Search, Wine, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/directory", label: "Directory" },
  { href: "/top-revenue", label: "Top Revenue" },
  { href: "/violations", label: "Violations" },
  { href: "/new-applications", label: "New Applications" },
  { href: "/pricing", label: "Data Lists" },
] as const;

export function Header(): ReactElement {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Wine className="size-5 text-amber-600" />
          <span className="text-base font-bold tracking-tight">
            BarBook Texas
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/directory"
            className="hidden rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 sm:inline-flex"
          >
            <Search className="size-4" />
            <span className="sr-only">Search</span>
          </Link>

          <Link
            href="/pricing"
            className={cn(buttonVariants({ size: "sm" }), "hidden md:inline-flex")}
          >
            Data Lists
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 md:hidden"
          >
            {mobileOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
            <span className="sr-only">Toggle menu</span>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t bg-white px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/pricing"
              onClick={() => setMobileOpen(false)}
              className={cn(buttonVariants({ size: "sm" }), "mt-2 w-full")}
            >
              Data Lists
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

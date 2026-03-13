import Link from 'next/link';
import type { ReactNode } from 'react';

const footerLinks = [
  { href: '/directory', label: 'Directory' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/data', label: 'Data Lists' },
  { href: '/about', label: 'About' },
] as const;

export function Footer(): ReactNode {
  return (
    <footer className="border-t border-gray-800 bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div>
            <span className="text-lg font-bold text-amber-600">LiquorScope</span>
            <p className="mt-1 text-sm text-gray-400">
              Texas Liquor License Intelligence
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-2">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-400 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-6">
          <p className="text-xs text-gray-500">
            Powered by verified TABC public data. Updated daily.
          </p>
        </div>
      </div>
    </footer>
  );
}

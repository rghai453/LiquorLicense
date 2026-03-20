import Link from 'next/link';
import type { ReactElement } from 'react';
import { Separator } from '@/components/ui/separator';

const productLinks = [
  { href: '/directory', label: 'Directory' },
  { href: '/top-revenue', label: 'Top Revenue' },
  { href: '/violations', label: 'Violations' },
  { href: '/new-applications', label: 'New Applications' },
  { href: '/pricing', label: 'Pricing' },
] as const;

const legalLinks = [
  { href: '/about', label: 'About' },
  { href: '/pricing', label: 'Data Lists' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
] as const;

export function Footer(): ReactElement {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <span className="text-sm font-bold tracking-tight">BarBook Texas</span>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              Texas liquor license intelligence.
              <br />
              Search TABC data, revenue reports, and violations.
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Product
            </p>
            <nav className="mt-2 flex flex-col gap-1.5">
              {productLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Legal
            </p>
            <nav className="mt-2 flex flex-col gap-1.5">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <Separator className="my-6" />

        <p className="text-xs text-muted-foreground">
          Data sourced from the Texas Alcoholic Beverage Commission (TABC) and
          Texas Comptroller Mixed Beverage Gross Receipts reports. Updated daily.
          Not affiliated with TABC.
        </p>
      </div>
    </footer>
  );
}

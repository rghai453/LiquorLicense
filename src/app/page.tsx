import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Building2,
  MapPin,
  BarChart3,
  Landmark,
  ArrowRight,
  Search,
  ArrowUpRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button-variants';
import { cn } from '@/lib/utils';
import { getHomeStats, getTopCities, getRecentLicenses } from '@/db/queries';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'BarBook Texas — Texas Liquor License Intelligence',
  description:
    'Search verified Texas liquor licenses with revenue reports, violations, and analytics. Updated daily from TABC public records.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'BarBook Texas — Texas Liquor License Intelligence',
    description:
      'Search verified Texas liquor licenses with revenue reports, violations, and analytics.',
    type: 'website',
  },
};

export default async function HomePage(): Promise<React.ReactElement> {
  const [stats, topCities, recentLicenses] = await Promise.all([
    getHomeStats(),
    getTopCities(),
    getRecentLicenses(),
  ]);

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative isolate bg-[#3d1f0a] pb-32 pt-12 md:pt-20 md:pb-44">
        {/* Warm radial glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 20% 40%, rgba(217,119,6,0.12) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 80% 20%, rgba(251,191,36,0.06) 0%, transparent 60%)',
          }}
        />
        {/* Grain overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1
              className="text-[clamp(2.4rem,5vw,4rem)] font-extrabold leading-[0.95] tracking-tight text-white"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Every Liquor License{' '}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">
                  in Texas.
                </span>
                <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-gradient-to-r from-amber-400/60 to-transparent" />
              </span>
            </h1>

          </div>

          {/* Search */}
          <form action="/directory" method="GET" className="mt-10 max-w-2xl">
            <div className="group relative">
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-transparent opacity-0 blur-sm transition-opacity duration-300 group-focus-within:opacity-100" />
              <div className="relative flex items-center">
                <Search className="absolute left-5 size-5 text-stone-400 transition-colors group-focus-within:text-amber-500" />
                <input
                  name="q"
                  type="search"
                  placeholder="Search by business name, city, or license number..."
                  className="relative h-14 w-full rounded-2xl border-0 !bg-white pl-13 pr-5 text-base !text-stone-900 placeholder:!text-stone-400 shadow-2xl shadow-black/30 outline-none transition-colors focus:ring-2 focus:ring-amber-400/50"
                />
              </div>
            </div>
          </form>

        </div>
      </section>

      {/* Stats Bar — overlapping hero */}
      <section className="relative z-10 mx-auto -mt-16 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-stone-200/80 shadow-xl shadow-stone-900/5 ring-1 ring-stone-200 lg:grid-cols-4">
          {[
            {
              icon: Building2,
              label: 'Active Licenses',
              value: stats.totalLicenses.toLocaleString(),
            },
            {
              icon: MapPin,
              label: 'Cities Covered',
              value: stats.totalCities.toLocaleString(),
            },
            {
              icon: Landmark,
              label: 'Counties',
              value: stats.totalCounties.toLocaleString(),
            },
            {
              icon: BarChart3,
              label: 'Revenue Tracked',
              value: `$${Math.round(stats.totalRevenue / 100).toLocaleString()}`,
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="group relative bg-white px-5 py-5 transition-colors hover:bg-stone-50/80"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 ring-1 ring-amber-200/50">
                    <Icon className="size-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-stone-400">
                      {stat.label}
                    </p>
                    <p className="text-xl font-bold tabular-nums tracking-tight text-stone-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Browse by City */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-stone-900">
              Browse by City
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Explore licenses across {stats.totalCities.toLocaleString()} Texas cities
            </p>
          </div>
          <Link
            href="/directory"
            className="group hidden items-center gap-1.5 text-sm font-medium text-stone-500 transition-colors hover:text-amber-600 sm:flex"
          >
            View all
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
          {topCities.map((item, i) => (
            <Link
              key={item.city}
              href={`/cities/${encodeURIComponent(item.city.toLowerCase())}`}
              className="group"
            >
              <div
                className={cn(
                  'relative overflow-hidden rounded-xl border border-stone-200/80 bg-white px-4 py-3.5 transition-all duration-200 hover:border-amber-300/60 hover:shadow-md hover:shadow-amber-900/5',
                  i < 4 && 'border-stone-300/60'
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      'text-sm font-semibold text-stone-800 transition-colors group-hover:text-amber-700',
                      i < 4 && 'text-stone-900'
                    )}
                  >
                    {item.city}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium tabular-nums text-stone-400">
                      {item.count.toLocaleString()}
                    </span>
                    <ArrowUpRight className="size-3 text-stone-300 transition-all group-hover:text-amber-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
                {i < 4 && (
                  <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-stone-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-300"
                      style={{
                        width: `${Math.min(100, (item.count / topCities[0].count) * 100)}%`,
                      }}
                    />
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        <Link
          href="/directory"
          className="mt-5 flex items-center justify-center gap-1.5 text-sm font-medium text-stone-500 transition-colors hover:text-amber-600 sm:hidden"
        >
          View all cities
          <ArrowRight className="size-3.5" />
        </Link>
      </section>

      {/* Recently Added */}
      <section className="border-y border-stone-200/80 bg-stone-50/50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-stone-900">
                Recently Added
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                Latest license applications and approvals
              </p>
            </div>
            <Link
              href="/new-applications"
              className="group hidden items-center gap-1.5 text-sm font-medium text-stone-500 transition-colors hover:text-amber-600 sm:flex"
            >
              View all
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-4">
            {recentLicenses.map((lic) => (
              <Link
                key={lic.slug}
                href={`/licenses/${lic.slug}`}
                className="group"
              >
                <div className="relative overflow-hidden rounded-xl border border-stone-200/80 bg-white p-4 transition-all duration-200 hover:border-amber-300/60 hover:shadow-md hover:shadow-amber-900/5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-stone-800 transition-colors group-hover:text-amber-700">
                      {lic.businessName}
                    </p>
                    <ArrowUpRight className="size-3.5 shrink-0 text-stone-300 transition-all group-hover:text-amber-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <span className="text-xs text-stone-400">{lic.city}</span>
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      {lic.licenseType}
                    </Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <Link
            href="/new-applications"
            className="mt-5 flex items-center justify-center gap-1.5 text-sm font-medium text-stone-500 transition-colors hover:text-amber-600 sm:hidden"
          >
            View all new applications
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="relative isolate overflow-hidden bg-[#3d1f0a]">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 70% at 50% 120%, rgba(217,119,6,0.15) 0%, transparent 70%)',
          }}
        />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 py-20 text-center sm:px-6 lg:px-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
              Need this data in a spreadsheet?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-stone-400">
              Download verified TABC datasets as CSV. Active bar licenses,
              new applications, or the full state database.
            </p>
          </div>
          <Link
            href="/pricing"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 px-7 text-sm font-semibold text-stone-900 shadow-lg shadow-amber-900/20 transition-all hover:from-amber-300 hover:to-amber-400 hover:shadow-amber-900/30 active:translate-y-px"
          >
            Browse Data Lists
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* Trust */}
      <section className="border-t border-stone-200/80 bg-stone-50/50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-center text-xs leading-relaxed text-stone-400">
            Data sourced from the Texas Alcoholic Beverage Commission (TABC) and
            Texas Comptroller Mixed Beverage Gross Receipts reports. Updated daily.
          </p>
        </div>
      </section>
    </div>
  );
}

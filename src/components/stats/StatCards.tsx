import type { ReactNode } from 'react';

interface Stat {
  label: string;
  value: string | number;
  change?: string;
}

interface StatCardsProps {
  stats: Stat[];
}

function isPositiveChange(change: string): boolean {
  return change.startsWith('+');
}

export function StatCards({ stats }: StatCardsProps): ReactNode {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
        >
          <p className="text-sm font-medium text-gray-500">{stat.label}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {stat.value}
          </p>
          {stat.change && (
            <p
              className={`mt-1 text-sm font-medium ${
                isPositiveChange(stat.change) ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {stat.change}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

import type { ReactNode } from 'react';

type BadgeVariant = 'active' | 'suspended' | 'revoked' | 'expired' | 'default';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  active: 'bg-green-100 text-green-800',
  suspended: 'bg-yellow-100 text-yellow-800',
  revoked: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-600',
  default: 'bg-blue-100 text-blue-800',
};

export function Badge({ variant = 'default', children }: BadgeProps): ReactNode {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]}`}
    >
      {children}
    </span>
  );
}

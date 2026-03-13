import Link from 'next/link';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  href?: string;
}

export function Card({ children, className = '', href }: CardProps): ReactNode {
  const baseStyles =
    'rounded-lg border border-gray-200 bg-white shadow-sm';
  const hoverStyles = href ? 'hover:shadow-md hover:border-gray-300 transition-shadow' : '';

  if (href) {
    return (
      <Link
        href={href}
        className={`block ${baseStyles} ${hoverStyles} ${className}`}
      >
        {children}
      </Link>
    );
  }

  return (
    <div className={`${baseStyles} ${className}`}>
      {children}
    </div>
  );
}

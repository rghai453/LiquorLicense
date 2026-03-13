import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes, ReactNode } from 'react';

interface TableProps extends HTMLAttributes<HTMLTableElement> {
  children: ReactNode;
}

interface TableSectionProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
}

interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
}

interface TableHeaderProps extends ThHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
}

interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  children?: ReactNode;
}

export function Table({ children, className = '', ...props }: TableProps): ReactNode {
  return (
    <div className="w-full overflow-x-auto">
      <table className={`w-full text-sm ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children, className = '', ...props }: TableSectionProps): ReactNode {
  return (
    <thead className={`bg-gray-50 ${className}`} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className = '', ...props }: TableSectionProps): ReactNode {
  return (
    <tbody className={`divide-y divide-gray-200 ${className}`} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className = '', ...props }: TableRowProps): ReactNode {
  return (
    <tr className={`border-b border-gray-200 ${className}`} {...props}>
      {children}
    </tr>
  );
}

export function TableHeader({ children, className = '', ...props }: TableHeaderProps): ReactNode {
  return (
    <th
      className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 ${className}`}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className = '', ...props }: TableCellProps): ReactNode {
  return (
    <td className={`px-4 py-3 text-gray-700 ${className}`} {...props}>
      {children}
    </td>
  );
}

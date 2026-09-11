import type { ReactNode } from 'react';

export function ErrorText({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`text-sm text-red-400 text-center ${className}`}>{children}</p>;
}

export function EmptyText({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`text-sm text-gray-400 text-center ${className}`}>{children}</p>;
}

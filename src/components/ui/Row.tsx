import type { ReactNode } from 'react';

interface RowProps {
  label: string;
  children: ReactNode;
}

export default function Row({ label, children }: RowProps) {
  return (
    <div className="flex items-center justify-between text-sm py-3 border-b border-gray-50 last:border-0">
      <span className="text-gray-400">{label}</span>
      <span className="text-gray-800 font-medium">{children}</span>
    </div>
  );
}

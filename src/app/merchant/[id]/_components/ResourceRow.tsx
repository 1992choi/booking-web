'use client';

import { formatPrice } from '@/lib/utils/format';
import type { Resource } from '@/lib/types/merchant';

export function ResourceRow({
  resource,
  isMerchant,
  onEdit,
  onManageTimes,
}: {
  resource: Resource;
  isMerchant: boolean;
  onEdit: (r: Resource) => void;
  onManageTimes: (r: Resource) => void;
}) {
  return (
    <div className="py-3.5 border-b border-gray-50 last:border-0 flex items-center justify-between gap-3">
      <div
        className={`min-w-0 flex-1 ${isMerchant ? 'cursor-pointer' : ''}`}
        onClick={isMerchant ? () => onEdit(resource) : undefined}
      >
        <p className="text-sm font-medium text-gray-800 truncate">{resource.name}</p>
        {resource.description && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{resource.description}</p>
        )}
        <p className="text-xs text-gray-400 mt-0.5">
          최대 {resource.maxCapacity}인 · {formatPrice(resource.price)}
        </p>
      </div>
      {isMerchant && (
        <button
          onClick={() => onManageTimes(resource)}
          className="text-xs text-gray-400 hover:text-blue-500 transition-colors flex-shrink-0"
        >
          이용시간
        </button>
      )}
    </div>
  );
}

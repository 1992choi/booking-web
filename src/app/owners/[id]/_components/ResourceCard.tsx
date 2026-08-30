'use client';

import { formatPrice } from '@/lib/utils/format';
import type { Resource } from '@/lib/types/merchant';

export function ResourceCard({
  resource,
  onBook,
}: {
  resource: Resource;
  onBook: (r: Resource) => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 truncate">{resource.name}</h3>
          {resource.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">{resource.description}</p>
          )}
          <div className="flex items-center gap-3 mt-3 text-sm text-gray-500">
            <span>👥 최대 {resource.maxCapacity}인</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-base font-bold text-blue-500">{formatPrice(resource.price)}</p>
          <p className="text-xs text-gray-400 mt-0.5">1회</p>
        </div>
      </div>

      <button
        onClick={() => onBook(resource)}
        className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl py-2.5 transition-colors"
      >
        예약 가능 시간 보기
      </button>
    </div>
  );
}

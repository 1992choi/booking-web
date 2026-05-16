'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { getOwners } from '@/lib/api/owners';
import type { OwnerSummary, OwnerType } from '@/lib/types/owner';

type FilterType = OwnerType | 'ALL';

const TYPE_LABELS: Record<OwnerType, string> = {
  PENSION: '펜션',
  CLASS: '클래스',
  FACILITY: '시설',
  CONSULTING: '컨설팅',
};

const TYPE_COLORS: Record<OwnerType, string> = {
  PENSION:    'bg-blue-50 text-blue-600',
  CLASS:      'bg-green-50 text-green-600',
  FACILITY:   'bg-purple-50 text-purple-600',
  CONSULTING: 'bg-orange-50 text-orange-600',
};

interface CategoryTab {
  value: FilterType;
  label: string;
  img: string;
}

const CATEGORY_TABS: CategoryTab[] = [
  { value: 'ALL',      label: '전체',   img: '/icons/all.jpeg' },
  { value: 'PENSION',  label: '펜션',   img: '/icons/pension.jpeg' },
  { value: 'CLASS',    label: '클래스', img: '/icons/class.webp' },
  { value: 'FACILITY', label: '시설',   img: '/icons/facility.jpeg' },
];

const VISIBLE_TYPES = new Set<OwnerType>(['PENSION', 'CLASS', 'FACILITY']);

export default function HomePage() {
  const [owners, setOwners] = useState<OwnerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<FilterType>('ALL');

  useEffect(() => {
    getOwners()
      .then(setOwners)
      .catch(() => setError('업체 목록을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  const visibleTabs = CATEGORY_TABS;

  const filtered =
    selected === 'ALL'
      ? owners.filter((o) => VISIBLE_TYPES.has(o.type as OwnerType))
      : owners.filter((o) => o.type === selected);

  return (
    <>
      <Header />

      {/* 카테고리 탭 */}
      <div className="sticky top-14 z-40 bg-white border-b border-gray-100 pt-[70px]">
        <div className="max-w-screen-lg mx-auto px-4">
          <div className="flex justify-center">
            {visibleTabs.map((tab) => {
              const active = selected === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setSelected(tab.value)}
                  className={`flex flex-col items-center gap-1 flex-1 max-w-[120px] pt-3 pb-2.5 border-b-2 transition-colors ${
                    active
                      ? 'border-blue-500 text-blue-500'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={tab.img} alt={tab.label} className="w-13 h-14 object-contain" />
                  <span className="text-xs font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 업체 카드 목록 */}
      <main className="max-w-screen-lg mx-auto px-4 py-6">
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && error && (
          <p className="text-sm text-red-400 text-center py-16">{error}</p>
        )}

        {!loading && !error && filtered.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-16">해당 유형의 업체가 없습니다.</p>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filtered.map((owner) => (
              <Link
                key={owner.id}
                href={`/owners/${owner.id}`}
                className="group flex flex-col items-center justify-center aspect-square rounded-2xl border border-gray-200 bg-white hover:border-blue-400 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                  <span className="text-lg font-semibold text-blue-500">
                    {owner.name[0]}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-800 text-center px-4 leading-snug">
                  {owner.name}
                </span>
                <span className={`mt-3 text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[owner.type]}`}>
                  {TYPE_LABELS[owner.type]}
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

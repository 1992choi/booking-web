'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import { getMerchants } from '@/lib/api/merchants';
import { MERCHANT_TYPE_COLORS, MERCHANT_TYPE_LABELS } from '@/lib/constants/merchant';
import type { MerchantType } from '@/lib/types/merchant';

type FilterType = MerchantType | 'ALL';

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

const VISIBLE_TYPES = new Set<MerchantType>(['PENSION', 'CLASS', 'FACILITY']);

export default function HomePage() {
  const [selected, setSelected] = useState<FilterType>('ALL');

  const { data: merchants = [], isLoading, isError } = useQuery({
    queryKey: ['merchants'],
    queryFn: getMerchants,
  });

  const filtered =
    selected === 'ALL'
      ? merchants.filter((o) => VISIBLE_TYPES.has(o.type as MerchantType))
      : merchants.filter((o) => o.type === selected);

  return (
    <>
      <Header />

      {/* 카테고리 탭 */}
      <div className="sticky top-14 z-40 bg-white border-b border-gray-100 pt-[70px]">
        <div className="max-w-screen-lg mx-auto px-4">
          <div className="flex justify-center">
            {CATEGORY_TABS.map((tab) => {
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
                  <Image
                    src={tab.img}
                    alt={tab.label}
                    width={52}
                    height={56}
                    className="w-13 h-14 object-contain"
                  />
                  <span className="text-xs font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 업체 카드 목록 */}
      <main className="max-w-screen-lg mx-auto px-4 py-6">
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && isError && (
          <p className="text-sm text-red-400 text-center py-16">업체 목록을 불러오지 못했습니다.</p>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-16">해당 유형의 업체가 없습니다.</p>
        )}

        {!isLoading && !isError && filtered.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filtered.map((merchant) => (
              <Link
                key={merchant.id}
                href={`/owners/${merchant.id}`}
                className="group flex flex-col items-center justify-center aspect-square rounded-2xl border border-gray-200 bg-white hover:border-blue-400 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                  <span className="text-lg font-semibold text-blue-500">
                    {merchant.name[0]}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-800 text-center px-4 leading-snug">
                  {merchant.name}
                </span>
                <span className={`mt-3 text-xs font-semibold px-2 py-0.5 rounded-full ${MERCHANT_TYPE_COLORS[merchant.type]}`}>
                  {MERCHANT_TYPE_LABELS[merchant.type]}
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

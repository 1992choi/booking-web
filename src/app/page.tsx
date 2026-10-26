'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useInfiniteQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import { SkeletonList } from '@/components/ui/Skeleton';
import { EmptyText, ErrorText } from '@/components/ui/StatusMessage';
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
const CATEGORY_VALUES = new Set<string>(CATEGORY_TABS.map((t) => t.value));

function isFilterType(value: string | null): value is FilterType {
  return value !== null && CATEGORY_VALUES.has(value);
}

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<FilterType>(() => {
    const category = searchParams.get('category');
    return isFilterType(category) ? category : 'ALL';
  });
  const [keyword, setKeyword] = useState('');

  const handleSelect = (value: FilterType) => {
    setSelected(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'ALL') {
      params.delete('category');
    } else {
      params.set('category', value);
    }
    const query = params.toString();
    router.replace(query ? `/?${query}` : '/', { scroll: false });
  };

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['merchants', selected],
    queryFn: ({ pageParam }) => getMerchants(selected === 'ALL' ? undefined : selected, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.page < lastPage.totalPages - 1 ? lastPage.page + 1 : undefined),
  });

  const merchants = data?.pages.flatMap((p) => p.content) ?? [];

  // ALL 탭은 서버가 타입 필터 없이 반환하므로, 알려진 카테고리(탭에 없는 유형이 추가될 경우 대비)만 클라이언트에서 한 번 더 걸러낸다.
  const byType = selected === 'ALL' ? merchants.filter((o) => VISIBLE_TYPES.has(o.type as MerchantType)) : merchants;

  // 현재까지 로드된 페이지 범위 내에서만 이름으로 필터링 (전체 검색은 백엔드 미지원)
  const trimmedKeyword = keyword.trim();
  const filtered = trimmedKeyword
    ? byType.filter((o) => o.name.toLowerCase().includes(trimmedKeyword.toLowerCase()))
    : byType;

  return (
    <>
      <Header />

      {/* 카테고리 탭 */}
      <div className="sticky top-14 z-40 bg-white border-b border-gray-100 pt-[70px]">
        <div className="max-w-(--breakpoint-lg) mx-auto px-4">
          <div className="flex justify-center">
            {CATEGORY_TABS.map((tab) => {
              const active = selected === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => handleSelect(tab.value)}
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
      <main className="max-w-(--breakpoint-lg) mx-auto px-4 py-6">
        <div className="relative mb-5">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="업체 이름 검색 (현재 불러온 목록 내)"
            aria-label="업체 이름 검색"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {isLoading && (
          <SkeletonList
            count={8}
            itemClassName="aspect-square rounded-2xl"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
          />
        )}

        {!isLoading && isError && (
          <ErrorText className="py-16">업체 목록을 불러오지 못했습니다.</ErrorText>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <EmptyText className="py-16">
            {trimmedKeyword ? '검색 결과가 없습니다.' : '해당 유형의 업체가 없습니다.'}
          </EmptyText>
        )}

        {!isLoading && !isError && filtered.length > 0 && (
          <>
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

            {hasNextPage && (
              <button
                onClick={() => fetchNextPage()}
                className="mt-5 w-full text-sm text-gray-500 border border-gray-200 rounded-xl py-3 hover:border-blue-300 hover:text-blue-500 transition-colors"
              >
                더 보기
              </button>
            )}
          </>
        )}
      </main>
    </>
  );
}

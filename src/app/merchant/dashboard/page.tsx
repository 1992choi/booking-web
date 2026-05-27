'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { getMerchants, getMyMerchants } from '@/lib/api/merchants';
import { useAuthStore } from '@/lib/store/auth';
import type { MerchantSummary, MerchantType } from '@/lib/types/merchant';

const TYPE_LABELS: Record<MerchantType, string> = {
  PENSION:    '펜션',
  CLASS:      '클래스',
  FACILITY:   '시설',
};

const TYPE_COLORS: Record<MerchantType, string> = {
  PENSION:  'bg-blue-50 text-blue-600',
  CLASS:    'bg-green-50 text-green-600',
  FACILITY: 'bg-purple-50 text-purple-600',
};

function MerchantCard({ merchant, isMerchant }: { merchant: MerchantSummary; isMerchant: boolean }) {
  const router = useRouter();
  return (
    <div
      className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer"
      onClick={() => router.push(`/merchant/${merchant.id}`)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-base font-semibold text-gray-900 truncate">{merchant.name}</h2>
          <span className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[merchant.type]}`}>
            {TYPE_LABELS[merchant.type]}
          </span>
        </div>
        {isMerchant && (
          <Link
            href={`/merchant/${merchant.id}/reservations`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs font-medium text-blue-500 hover:text-blue-600 transition-colors ml-3 flex-shrink-0"
          >
            예약 관리
          </Link>
        )}
      </div>
    </div>
  );
}

export default function MerchantDashboardPage() {
  const { role } = useAuthStore();
  const isAdmin = role === 'ADMIN';
  const isMerchant = role === 'MERCHANT';

  const [merchants, setMerchants] = useState<MerchantSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = isAdmin ? getMerchants : getMyMerchants;
    fetch()
      .then(setMerchants)
      .catch(() => setError('업체 목록을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [isAdmin]);

  return (
    <>
      <Header />

      <main className="max-w-screen-sm mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">업체 관리</h1>
          {!isAdmin && (
            <Link
              href="/merchant/register"
              className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl transition-colors"
            >
              + 업체 등록
            </Link>
          )}
        </div>

        {isAdmin && (
          <p className="text-xs text-gray-400 mb-4">전체 등록 업체 목록입니다.</p>
        )}

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {!loading && error && (
          <p className="text-sm text-red-400 text-center py-16">{error}</p>
        )}

        {!loading && !error && merchants.length === 0 && (
          <div className="text-center py-20">
            <p className="text-sm text-gray-400 mb-4">등록된 업체가 없습니다.</p>
            {!isAdmin && (
              <Link
                href="/merchant/register"
                className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl transition-colors"
              >
                업체 등록하기
              </Link>
            )}
          </div>
        )}

        {!loading && !error && merchants.length > 0 && (
          <div className="space-y-3">
            {merchants.map((merchant) => (
              <MerchantCard key={merchant.id} merchant={merchant} isMerchant={isMerchant} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

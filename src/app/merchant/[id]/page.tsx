'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { getMerchant } from '@/lib/api/merchants';
import { useAuthStore } from '@/lib/store/auth';
import type { MerchantDetail, MerchantType, Resource } from '@/lib/types/merchant';

const TYPE_LABELS: Record<MerchantType, string> = {
  PENSION:    '펜션',
  CLASS:      '클래스',
  FACILITY:   '시설',
  CONSULTING: '컨설팅',
};

const TYPE_COLORS: Record<MerchantType, string> = {
  PENSION:    'bg-blue-50 text-blue-600',
  CLASS:      'bg-green-50 text-green-600',
  FACILITY:   'bg-purple-50 text-purple-600',
  CONSULTING: 'bg-orange-50 text-orange-600',
};

function formatPrice(price: number) {
  return price.toLocaleString('ko-KR') + '원';
}

function ResourceRow({ resource }: { resource: Resource }) {
  return (
    <div className="py-3.5 border-b border-gray-50 last:border-0">
      <p className="text-sm font-medium text-gray-800 truncate">{resource.name}</p>
      {resource.description && (
        <p className="text-xs text-gray-400 mt-0.5 truncate">{resource.description}</p>
      )}
      <p className="text-xs text-gray-400 mt-0.5">
        최대 {resource.maxCapacity}인 · {formatPrice(resource.price)}
      </p>
    </div>
  );
}

export default function MerchantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { role } = useAuthStore();
  const isMerchant = role === 'MERCHANT';

  const [merchant, setMerchant] = useState<MerchantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    getMerchant(Number(id))
      .then(setMerchant)
      .catch(() => setError('업체 정보를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <>
      <Header />

      <main className="max-w-screen-sm mx-auto px-4 py-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-5 transition-colors"
        >
          ← 목록으로
        </button>

        {loading && (
          <div className="space-y-3">
            <div className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
            <div className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
          </div>
        )}

        {!loading && error && (
          <p className="text-sm text-red-400 text-center py-20">{error}</p>
        )}

        {!loading && !error && merchant && (
          <>
            <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-900">{merchant.name}</h2>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[merchant.type]}`}>
                    {TYPE_LABELS[merchant.type]}
                  </span>
                </div>
                {isMerchant && (
                  <Link
                    href={`/merchant/${id}/edit`}
                    className="text-sm text-blue-500 hover:text-blue-600 font-medium transition-colors"
                  >
                    수정
                  </Link>
                )}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">예약 대상</h3>

              {merchant.resources.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">등록된 예약 대상이 없습니다.</p>
              ) : (
                <div>
                  {merchant.resources.map((r) => (
                    <ResourceRow key={r.id} resource={r} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </>
  );
}

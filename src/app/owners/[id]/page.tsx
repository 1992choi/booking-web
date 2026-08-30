'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/Header';
import BackButton from '@/components/ui/BackButton';
import { getMerchant } from '@/lib/api/merchants';
import { getReviewsByMerchant } from '@/lib/api/reviews';
import { useDocumentTitle } from '@/lib/hooks/useDocumentTitle';
import { MERCHANT_TYPE_COLORS, MERCHANT_TYPE_LABELS } from '@/lib/constants/merchant';
import { useAuthStore } from '@/lib/store/auth';
import type { Resource } from '@/lib/types/merchant';
import type { Review } from '@/lib/types/review';
import { AvailableTimesModal } from './_components/AvailableTimesModal';
import { ResourceCard } from './_components/ResourceCard';
import { ReviewCard } from './_components/ReviewCard';

export default function MerchantPublicDetailPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  const { data: merchant, isLoading: loading, isError: error } = useQuery({
    queryKey: ['merchant', id],
    queryFn: () => getMerchant(Number(id)),
  });
  useDocumentTitle(merchant ? merchant.name : '업체 상세');

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => getReviewsByMerchant(Number(id)).catch(() => [] as Review[]),
  });

  return (
    <>
      <Header />

      <main className="max-w-screen-sm mx-auto px-4 py-6">
        <BackButton label="목록으로" />

        {loading && (
          <div className="space-y-4">
            <div className="h-8 w-48 bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-4 w-24 bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
            <div className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
          </div>
        )}

        {!loading && error && (
          <p className="text-sm text-red-400 text-center py-20">업체 정보를 불러오지 못했습니다.</p>
        )}

        {!loading && !error && merchant && (
          <>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{merchant.name}</h1>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${MERCHANT_TYPE_COLORS[merchant.type]}`}>
                  {MERCHANT_TYPE_LABELS[merchant.type]}
                </span>
              </div>
              <p className="text-sm text-gray-400">
                {merchant.resources.length}개의 예약 가능 항목
              </p>
            </div>

            <div className="border-t border-gray-100 mb-6" />

            {merchant.resources.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-16">등록된 항목이 없습니다.</p>
            ) : (
              <div className="space-y-4">
                {merchant.resources.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onBook={setSelectedResource}
                  />
                ))}
              </div>
            )}

            <div className="border-t border-gray-100 my-6" />

            <div>
              <h2 className="text-base font-bold text-gray-900 mb-3">
                이용 후기{reviews.length > 0 && ` (${reviews.length})`}
              </h2>

              {reviewsLoading && (
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse" />
                  ))}
                </div>
              )}

              {!reviewsLoading && reviews.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">아직 작성된 후기가 없습니다.</p>
              )}

              {!reviewsLoading && reviews.length > 0 && (
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      isMine={!!user && user.id === review.userId}
                      onUpdated={(updated) =>
                        queryClient.setQueryData(['reviews', id], (prev: Review[] | undefined) =>
                          prev?.map((r) => (r.id === updated.id ? updated : r))
                        )
                      }
                      onDeleted={(reviewId) =>
                        queryClient.setQueryData(['reviews', id], (prev: Review[] | undefined) =>
                          prev?.filter((r) => r.id !== reviewId)
                        )
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {selectedResource && (
        <AvailableTimesModal
          resource={selectedResource}
          onClose={() => setSelectedResource(null)}
        />
      )}
    </>
  );
}

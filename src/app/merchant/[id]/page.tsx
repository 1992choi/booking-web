'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import BackButton from '@/components/ui/BackButton';
import { getMerchant } from '@/lib/api/merchants';
import { deleteResource } from '@/lib/api/resources';
import { useDocumentTitle } from '@/lib/hooks/useDocumentTitle';
import { MERCHANT_TYPE_COLORS, MERCHANT_TYPE_LABELS } from '@/lib/constants/merchant';
import { useAuthStore } from '@/lib/store/auth';
import type { MerchantDetail, Resource } from '@/lib/types/merchant';
import { ResourceFormModal } from './_components/ResourceFormModal';
import { DeleteConfirmModal } from './_components/DeleteConfirmModal';
import { AvailableTimeManagerModal } from './_components/AvailableTimeManagerModal';
import { ResourceRow } from './_components/ResourceRow';

// null = 모달 닫힘, 'new' = 새 리소스 추가, Resource = 수정 대상
type ResourceFormTarget = Resource | 'new' | null;

export default function MerchantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const role = useAuthStore((s) => s.role);
  const isMerchant = role === 'MERCHANT';

  const [merchant, setMerchant] = useState<MerchantDetail | null>(null);
  useDocumentTitle(merchant ? merchant.name : '업체 상세');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formTarget, setFormTarget] = useState<ResourceFormTarget>(null);
  const [deleteTarget, setDeleteTarget] = useState<Resource | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [timeManageTarget, setTimeManageTarget] = useState<Resource | null>(null);

  useEffect(() => {
    if (!id) return;
    getMerchant(Number(id))
      .then(setMerchant)
      .catch(() => setError('업체 정보를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [id]);

  function handleSaved(saved: Resource) {
    setMerchant((prev) => {
      if (!prev) return prev;
      const exists = prev.resources.some((r) => r.id === saved.id);
      const resources = exists
        ? prev.resources.map((r) => (r.id === saved.id ? saved : r))
        : [...prev.resources, saved];
      return { ...prev, resources };
    });
    setFormTarget(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteResource(deleteTarget.id);
      setMerchant((prev) =>
        prev ? { ...prev, resources: prev.resources.filter((r) => r.id !== deleteTarget.id) } : prev
      );
      setDeleteTarget(null);
    } catch {
      // 삭제 실패 시 모달 유지
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <>
      <Header />

      <main className="max-w-screen-sm mx-auto px-4 py-6">
        <BackButton label="목록으로" />

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
            {/* 업체 정보 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-900">{merchant.name}</h2>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${MERCHANT_TYPE_COLORS[merchant.type]}`}>
                    {MERCHANT_TYPE_LABELS[merchant.type]}
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

            {/* 예약 대상 목록 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">예약 대상</h3>
                {isMerchant && (
                  <button
                    onClick={() => setFormTarget('new')}
                    className="text-xs font-medium text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    + 추가
                  </button>
                )}
              </div>

              {merchant.resources.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">등록된 예약 대상이 없습니다.</p>
              ) : (
                <div>
                  {merchant.resources.map((r) => (
                    <ResourceRow
                      key={r.id}
                      resource={r}
                      isMerchant={isMerchant}
                      onEdit={setFormTarget}
                      onManageTimes={setTimeManageTarget}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* 리소스 추가/수정 모달 */}
      {formTarget !== null && merchant && (
        <ResourceFormModal
          merchantId={Number(id)}
          initial={formTarget === 'new' ? null : formTarget}
          onClose={() => setFormTarget(null)}
          onSaved={handleSaved}
          onDelete={formTarget !== 'new' ? () => {
            setDeleteTarget(formTarget);
            setFormTarget(null);
          } : undefined}
        />
      )}

      {/* 리소스 삭제 확인 모달 */}
      {deleteTarget && (
        <DeleteConfirmModal
          resource={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}

      {/* 이용 시간 관리 모달 */}
      {timeManageTarget && (
        <AvailableTimeManagerModal
          resource={timeManageTarget}
          onClose={() => setTimeManageTarget(null)}
        />
      )}
    </>
  );
}

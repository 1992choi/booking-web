'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { getMerchant } from '@/lib/api/merchants';
import { createResource, updateResource, deleteResource } from '@/lib/api/resources';
import type { ResourceRequest } from '@/lib/api/resources';
import { getErrorMessage } from '@/lib/api/axios';
import { useAuthStore } from '@/lib/store/auth';
import type { MerchantDetail, MerchantType, Resource } from '@/lib/types/merchant';

const TYPE_LABELS: Record<MerchantType, string> = {
  PENSION:  '펜션',
  CLASS:    '클래스',
  FACILITY: '시설',
};

const TYPE_COLORS: Record<MerchantType, string> = {
  PENSION:  'bg-blue-50 text-blue-600',
  CLASS:    'bg-green-50 text-green-600',
  FACILITY: 'bg-purple-50 text-purple-600',
};

function formatPrice(price: number) {
  return price.toLocaleString('ko-KR') + '원';
}

// ─── 리소스 폼 모달 ───────────────────────────────────────────────────
function ResourceFormModal({
  merchantId,
  initial,
  onClose,
  onSaved,
}: {
  merchantId: number;
  initial: Resource | null;
  onClose: () => void;
  onSaved: (resource: Resource) => void;
}) {
  const isEdit = initial !== null;
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [price, setPrice] = useState(String(initial?.price ?? ''));
  const [maxCapacity, setMaxCapacity] = useState(String(initial?.maxCapacity ?? ''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const params: ResourceRequest = {
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      maxCapacity: Number(maxCapacity),
    };
    try {
      const saved = isEdit
        ? await updateResource(initial!.id, params)
        : await createResource(merchantId, params);
      onSaved(saved);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-900">
            {isEdit ? '예약 대상 수정' : '예약 대상 추가'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: A동, 오전반, 1번 코트"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">설명 (선택)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="간단한 설명을 입력하세요"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">가격 (원)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                min={0}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">최대 인원</label>
              <input
                type="number"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(e.target.value)}
                placeholder="1"
                min={1}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-400 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading || !name.trim() || !price || !maxCapacity}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium rounded-xl py-3 transition-colors"
          >
            {loading ? '저장 중...' : isEdit ? '수정 완료' : '추가'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── 리소스 행 ────────────────────────────────────────────────────────
function ResourceRow({
  resource,
  isMerchant,
  onEdit,
  onDelete,
}: {
  resource: Resource;
  isMerchant: boolean;
  onEdit: (r: Resource) => void;
  onDelete: (r: Resource) => void;
}) {
  return (
    <div className="py-3.5 border-b border-gray-50 last:border-0 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{resource.name}</p>
        {resource.description && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{resource.description}</p>
        )}
        <p className="text-xs text-gray-400 mt-0.5">
          최대 {resource.maxCapacity}인 · {formatPrice(resource.price)}
        </p>
      </div>
      {isMerchant && (
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onEdit(resource)}
            className="text-xs text-gray-400 hover:text-blue-500 transition-colors"
          >
            수정
          </button>
          <button
            onClick={() => onDelete(resource)}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            삭제
          </button>
        </div>
      )}
    </div>
  );
}

// ─── 삭제 확인 모달 ───────────────────────────────────────────────────
function DeleteConfirmModal({
  resource,
  onClose,
  onConfirm,
  loading,
}: {
  resource: Resource;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 mx-4">
        <h2 className="text-base font-bold text-gray-900 mb-2">예약 대상 삭제</h2>
        <p className="text-sm text-gray-500 mb-6">
          <span className="font-medium text-gray-800">"{resource.name}"</span>을(를) 삭제하시겠습니까?
        </p>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 text-sm font-medium py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 text-sm font-medium py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:bg-gray-200 text-white transition-colors"
          >
            {loading ? '삭제 중...' : '삭제'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── 메인 페이지 ──────────────────────────────────────────────────────
export default function MerchantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { role } = useAuthStore();
  const isMerchant = role === 'MERCHANT';

  const [merchant, setMerchant] = useState<MerchantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formTarget, setFormTarget] = useState<Resource | null | 'new'>(undefined as any);
  const [deleteTarget, setDeleteTarget] = useState<Resource | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
    setFormTarget(undefined as any);
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
            {/* 업체 정보 */}
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
                      onDelete={setDeleteTarget}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* 추가/수정 모달 */}
      {(formTarget === 'new' || (formTarget && formTarget !== undefined)) && merchant && (
        <ResourceFormModal
          merchantId={Number(id)}
          initial={formTarget === 'new' ? null : formTarget as Resource}
          onClose={() => setFormTarget(undefined as any)}
          onSaved={handleSaved}
        />
      )}

      {/* 삭제 확인 모달 */}
      {deleteTarget && (
        <DeleteConfirmModal
          resource={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}
    </>
  );
}

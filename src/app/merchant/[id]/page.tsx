'use client';

import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import BackButton from '@/components/ui/BackButton';
import { getMerchant } from '@/lib/api/merchants';
import {
  createResource,
  updateResource,
  deleteResource,
  getAvailableTimes,
  createAvailableTime,
  updateAvailableTime,
  deleteAvailableTime,
} from '@/lib/api/resources';
import { getErrorMessage } from '@/lib/api/axios';
import Modal, { ModalHeader } from '@/components/ui/Modal';
import { useDocumentTitle } from '@/lib/hooks/useDocumentTitle';
import { MERCHANT_TYPE_COLORS, MERCHANT_TYPE_LABELS } from '@/lib/constants/merchant';
import { resourceSchema, availableTimeSchema } from '@/lib/validation/merchant';
import { formatPrice } from '@/lib/utils/format';
import { useAuthStore } from '@/lib/store/auth';
import type { MerchantDetail, Resource, AvailableTime } from '@/lib/types/merchant';

type ResourceFormValues = z.infer<typeof resourceSchema>;
type AvailableTimeFormValues = z.infer<typeof availableTimeSchema>;

const STATUS_LABELS: Record<AvailableTime['status'], string> = {
  OPEN:    '예약 가능',
  BLOCKED: '차단',
};

const STATUS_COLORS: Record<AvailableTime['status'], string> = {
  OPEN:    'bg-green-50 text-green-600',
  BLOCKED: 'bg-red-50 text-red-500',
};

function formatTime(dt: string) {
  return dt.slice(11, 16);
}

function toDatetimeLocal(dt: string) {
  return dt.slice(0, 16);
}

function toBackendTime(dt: string) {
  return dt + ':00';
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

// ─── 리소스 폼 모달 ───────────────────────────────────────────────────
function ResourceFormModal({
  merchantId,
  initial,
  onClose,
  onSaved,
  onDelete,
}: {
  merchantId: number;
  initial: Resource | null;
  onClose: () => void;
  onSaved: (resource: Resource) => void;
  onDelete?: () => void;
}) {
  const isEdit = initial !== null;
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      name: initial?.name ?? '',
      description: initial?.description ?? '',
      price: initial?.price ?? 0,
      maxCapacity: initial?.maxCapacity ?? 1,
    },
  });

  const onSubmit = async (values: ResourceFormValues) => {
    setErrorMsg('');
    try {
      const saved = isEdit
        ? await updateResource(initial!.id, values)
        : await createResource(merchantId, values);
      onSaved(saved);
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    }
  };

  return (
    <Modal onClose={onClose} labelId="resource-form-title">
      <ModalHeader
        id="resource-form-title"
        title={isEdit ? '예약 대상 수정' : '예약 대상 추가'}
        onClose={onClose}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label htmlFor="resource-name" className="block text-xs font-medium text-gray-500 mb-1.5">
            이름
          </label>
          <input
            {...register('name')}
            id="resource-name"
            type="text"
            placeholder="예: A동, 오전반, 1번 코트"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'resource-name-error' : undefined}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.name && (
            <p id="resource-name-error" className="mt-1 text-xs text-red-500">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="resource-description" className="block text-xs font-medium text-gray-500 mb-1.5">
            설명 (선택)
          </label>
          <input
            {...register('description')}
            id="resource-description"
            type="text"
            placeholder="간단한 설명을 입력하세요"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="resource-price" className="block text-xs font-medium text-gray-500 mb-1.5">
              가격 (원)
            </label>
            <input
              {...register('price')}
              id="resource-price"
              type="number"
              placeholder="0"
              min={0}
              aria-invalid={!!errors.price}
              aria-describedby={errors.price ? 'resource-price-error' : undefined}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.price && (
              <p id="resource-price-error" className="mt-1 text-xs text-red-500">
                {errors.price.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="resource-maxCapacity" className="block text-xs font-medium text-gray-500 mb-1.5">
              최대 인원
            </label>
            <input
              {...register('maxCapacity')}
              id="resource-maxCapacity"
              type="number"
              placeholder="1"
              min={1}
              aria-invalid={!!errors.maxCapacity}
              aria-describedby={errors.maxCapacity ? 'resource-maxCapacity-error' : undefined}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.maxCapacity && (
              <p id="resource-maxCapacity-error" className="mt-1 text-xs text-red-500">
                {errors.maxCapacity.message}
              </p>
            )}
          </div>
        </div>

        {errorMsg && <p className="text-sm text-red-400 text-center">{errorMsg}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium rounded-xl py-3 transition-colors"
        >
          {isSubmitting ? '저장 중...' : isEdit ? '수정 완료' : '추가'}
        </button>

        {isEdit && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="w-full border border-red-200 text-red-400 hover:bg-red-50 hover:text-red-500 text-sm font-medium rounded-xl py-3 transition-colors"
          >
            삭제
          </button>
        )}
      </form>
    </Modal>
  );
}

// ─── 삭제 확인 모달 (리소스) ──────────────────────────────────────────
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
    <Modal onClose={onClose} labelId="resource-delete-title" position="center" maxWidthClassName="max-w-sm mx-4">
      <h2 id="resource-delete-title" className="text-base font-bold text-gray-900 mb-2">
        예약 대상 삭제
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        <span className="font-medium text-gray-800">&quot;{resource.name}&quot;</span>을(를) 삭제하시겠습니까?
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
    </Modal>
  );
}

// ─── 이용 시간 추가/수정 모달 ─────────────────────────────────────────
function AvailableTimeFormModal({
  resourceId,
  initial,
  defaultDate,
  onClose,
  onSaved,
}: {
  resourceId: number;
  initial: AvailableTime | null;
  defaultDate: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = initial !== null;
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AvailableTimeFormValues>({
    resolver: zodResolver(availableTimeSchema),
    defaultValues: {
      startTime: initial ? toDatetimeLocal(initial.startTime) : `${defaultDate}T09:00`,
      endTime: initial ? toDatetimeLocal(initial.endTime) : `${defaultDate}T10:00`,
    },
  });

  const onSubmit = async (values: AvailableTimeFormValues) => {
    setErrorMsg('');
    try {
      if (isEdit) {
        await updateAvailableTime(initial!.id, toBackendTime(values.startTime), toBackendTime(values.endTime));
      } else {
        await createAvailableTime(resourceId, toBackendTime(values.startTime), toBackendTime(values.endTime));
      }
      onSaved();
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    }
  };

  return (
    <Modal onClose={onClose} labelId="available-time-form-title" zIndexClassName="z-[60]">
      <ModalHeader
        id="available-time-form-title"
        title={isEdit ? '이용 시간 수정' : '이용 시간 추가'}
        onClose={onClose}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label htmlFor="available-time-start" className="block text-xs font-medium text-gray-500 mb-1.5">
            시작 시간
          </label>
          <input
            {...register('startTime')}
            id="available-time-start"
            type="datetime-local"
            aria-invalid={!!errors.startTime}
            aria-describedby={errors.startTime ? 'available-time-start-error' : undefined}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.startTime && (
            <p id="available-time-start-error" className="mt-1 text-xs text-red-500">
              {errors.startTime.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="available-time-end" className="block text-xs font-medium text-gray-500 mb-1.5">
            종료 시간
          </label>
          <input
            {...register('endTime')}
            id="available-time-end"
            type="datetime-local"
            aria-invalid={!!errors.endTime}
            aria-describedby={errors.endTime ? 'available-time-end-error' : undefined}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.endTime && (
            <p id="available-time-end-error" className="mt-1 text-xs text-red-500">
              {errors.endTime.message}
            </p>
          )}
        </div>

        {errorMsg && <p className="text-sm text-red-400 text-center">{errorMsg}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium rounded-xl py-3 transition-colors"
        >
          {isSubmitting ? '저장 중...' : isEdit ? '수정 완료' : '추가'}
        </button>
      </form>
    </Modal>
  );
}

// ─── 이용 시간 삭제 확인 모달 ─────────────────────────────────────────
function AvailableTimeDeleteModal({
  time,
  onClose,
  onConfirm,
  loading,
}: {
  time: AvailableTime;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <Modal
      onClose={onClose}
      labelId="available-time-delete-title"
      position="center"
      maxWidthClassName="max-w-sm mx-4"
      zIndexClassName="z-[70]"
    >
      <h2 id="available-time-delete-title" className="text-base font-bold text-gray-900 mb-2">
        이용 시간 삭제
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        <span className="font-medium text-gray-800">
          {formatTime(time.startTime)} ~ {formatTime(time.endTime)}
        </span> 시간대를 삭제하시겠습니까?
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
    </Modal>
  );
}

// ─── 이용 시간 관리 모달 ──────────────────────────────────────────────
// null = 모달 닫힘, 'new' = 새로 추가, AvailableTime = 수정 대상
type TimeFormTarget = AvailableTime | 'new' | null;

function AvailableTimeManagerModal({
  resource,
  onClose,
}: {
  resource: Resource;
  onClose: () => void;
}) {
  const [date, setDate] = useState(todayString());
  const [times, setTimes] = useState<AvailableTime[]>([]);
  const [timesLoading, setTimesLoading] = useState(false);
  const [timesError, setTimesError] = useState('');
  const [formTarget, setFormTarget] = useState<TimeFormTarget>(null);
  const [deleteTarget, setDeleteTarget] = useState<AvailableTime | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchTimes = useCallback(async (d: string) => {
    setTimesLoading(true);
    setTimesError('');
    try {
      setTimes(await getAvailableTimes(resource.id, d));
    } catch {
      setTimesError('이용 시간을 불러오지 못했습니다.');
    } finally {
      setTimesLoading(false);
    }
  }, [resource.id]);

  useEffect(() => {
    fetchTimes(date);
  }, [date, fetchTimes]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteAvailableTime(deleteTarget.id);
      setDeleteTarget(null);
      fetchTimes(date);
    } catch {
      // 삭제 실패 시 모달 유지
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <>
      <Modal onClose={onClose} labelId="available-time-manager-title">
        <ModalHeader
          id="available-time-manager-title"
          title={`${resource.name} — 이용 시간 관리`}
          onClose={onClose}
        />

        <label htmlFor="available-time-manager-date" className="sr-only">
          조회 날짜
        </label>
        <input
          id="available-time-manager-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        />

        {timesLoading ? (
          <div className="space-y-2 mb-4">
            <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
          </div>
        ) : timesError ? (
          <p className="text-sm text-red-400 text-center py-4 mb-4">{timesError}</p>
        ) : times.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6 mb-4">해당 날짜에 등록된 이용 시간이 없습니다.</p>
        ) : (
          <div className="divide-y divide-gray-50 mb-4 max-h-60 overflow-y-auto">
            {times.map((t) => (
              <div key={t.id} className="py-3 flex items-center justify-between gap-2">
                <p className="text-sm text-gray-800 min-w-0 truncate">
                  {formatTime(t.startTime)} ~ {formatTime(t.endTime)}
                </p>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[t.status]}`}>
                    {STATUS_LABELS[t.status]}
                  </span>
                  <button
                    onClick={() => setFormTarget(t)}
                    className="text-xs text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => setDeleteTarget(t)}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => setFormTarget('new')}
          className="w-full border border-dashed border-blue-300 text-blue-500 hover:bg-blue-50 text-sm font-medium rounded-xl py-2.5 transition-colors"
        >
          + 시간 추가
        </button>
      </Modal>

      {formTarget !== null && (
        <AvailableTimeFormModal
          resourceId={resource.id}
          initial={formTarget === 'new' ? null : formTarget}
          defaultDate={date}
          onClose={() => setFormTarget(null)}
          onSaved={() => {
            setFormTarget(null);
            fetchTimes(date);
          }}
        />
      )}

      {deleteTarget && (
        <AvailableTimeDeleteModal
          time={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}
    </>
  );
}

// ─── 리소스 행 ────────────────────────────────────────────────────────
function ResourceRow({
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

// ─── 메인 페이지 ──────────────────────────────────────────────────────
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

'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getAvailableTimes } from '@/lib/api/resources';
import { createReservation } from '@/lib/api/reservations';
import { getErrorMessage } from '@/lib/api/axios';
import Modal from '@/components/ui/Modal';
import { formatPrice, formatTime, today } from '@/lib/utils/format';
import { useAuthStore } from '@/lib/store/auth';
import { useToastStore } from '@/lib/store/toast';
import type { Resource } from '@/lib/types/merchant';

export function AvailableTimesModal({
  resource,
  onClose,
}: {
  resource: Resource;
  onClose: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const showToast = useToastStore((s) => s.showToast);

  const [date, setDate] = useState(today());
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const { data: times = [], isLoading: loading, isError } = useQuery({
    queryKey: ['available-times', resource.id, date],
    queryFn: () => getAvailableTimes(resource.id, date),
  });

  const openTimes = times.filter((t) => t.status === 'OPEN');

  function changeDate(next: string) {
    setDate(next);
    setSelectedIds(new Set());
  }

  function toggleSlot(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const { mutate: reserve, isPending: booking } = useMutation({
    mutationFn: () =>
      createReservation({
        resourceId: resource.id,
        availableTimeIds: Array.from(selectedIds),
        headCount: 1,
      }),
    onSuccess: () => {
      showToast('success', '예약 요청이 접수되었습니다.\n예약 상태는 내 예약에서 확인해주세요.');
      onClose();
    },
    onError: (err) => {
      console.error('[예약 오류]', err);
      showToast('error', getErrorMessage(err));
    },
  });

  function handleReserve() {
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (selectedIds.size === 0) return;
    reserve();
  }

  const totalPrice = resource.price * selectedIds.size;

  return (
    <Modal onClose={onClose} labelId="available-times-title" panelClassName="max-h-[80vh] overflow-y-auto">
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 id="available-times-title" className="text-lg font-bold text-gray-900">{resource.name}</h2>
          <p className="text-sm text-blue-500 font-medium mt-0.5">{formatPrice(resource.price)}</p>
        </div>
        <button onClick={onClose} aria-label="닫기" className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
      </div>

      {/* 날짜 선택 */}
      <div className="mb-5">
        <label htmlFor="available-times-date" className="block text-xs font-medium text-gray-500 mb-1.5">
          날짜 선택
        </label>
        <input
          id="available-times-date"
          type="date"
          value={date}
          min={today()}
          onChange={(e) => changeDate(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 가능 시간 목록 */}
      <div>
        <p className="text-xs font-medium text-gray-500 mb-2">예약 가능 시간</p>

        {loading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && isError && (
          <p className="text-sm text-red-400 text-center py-6">조회에 실패했습니다.</p>
        )}

        {!loading && !isError && openTimes.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">선택한 날짜에 예약 가능한 시간이 없습니다.</p>
        )}

        {!loading && !isError && openTimes.length > 0 && (
          <div className="space-y-2">
            {openTimes.map((t) => {
              const isSelected = selectedIds.has(t.id);
              return (
                <button
                  key={t.id}
                  onClick={() => toggleSlot(t.id)}
                  aria-pressed={isSelected}
                  className={`w-full flex items-center justify-between rounded-xl px-4 py-3 transition-colors border ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  <span className={`text-sm font-medium ${isSelected ? 'text-blue-600' : 'text-gray-800'}`}>
                    {formatTime(t.startTime)} ~ {formatTime(t.endTime)}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-lg transition-colors ${
                    isSelected ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-500'
                  }`}>
                    {isSelected ? '선택됨' : '선택'}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 예약 버튼 영역 */}
      {!loading && !isError && openTimes.length > 0 && (
        <div className="mt-5 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">
              {selectedIds.size > 0 ? `${selectedIds.size}개 선택` : '시간대를 선택하세요'}
            </span>
            {selectedIds.size > 0 && (
              <span className="text-sm font-bold text-blue-500">{formatPrice(totalPrice)}</span>
            )}
          </div>
          <button
            onClick={handleReserve}
            disabled={selectedIds.size === 0 || booking}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl py-3 transition-colors"
          >
            {booking ? '예약 중...' : '예약하기'}
          </button>
        </div>
      )}
    </Modal>
  );
}

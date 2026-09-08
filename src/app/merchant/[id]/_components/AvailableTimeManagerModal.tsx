'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAvailableTimes, deleteAvailableTime } from '@/lib/api/resources';
import Modal, { ModalHeader } from '@/components/ui/Modal';
import { SkeletonList } from '@/components/ui/Skeleton';
import type { Resource, AvailableTime } from '@/lib/types/merchant';
import { STATUS_COLORS, STATUS_LABELS, formatTime, todayString } from './helpers';
import { AvailableTimeFormModal } from './AvailableTimeFormModal';
import { AvailableTimeDeleteModal } from './AvailableTimeDeleteModal';

// null = 모달 닫힘, 'new' = 새로 추가, AvailableTime = 수정 대상
type TimeFormTarget = AvailableTime | 'new' | null;

export function AvailableTimeManagerModal({
  resource,
  onClose,
}: {
  resource: Resource;
  onClose: () => void;
}) {
  const [date, setDate] = useState(todayString());
  const [formTarget, setFormTarget] = useState<TimeFormTarget>(null);
  const [deleteTarget, setDeleteTarget] = useState<AvailableTime | null>(null);
  const queryClient = useQueryClient();

  const timesQueryKey = ['available-times', resource.id, date];

  const { data: times = [], isLoading: timesLoading, isError: timesError } = useQuery({
    queryKey: timesQueryKey,
    queryFn: () => getAvailableTimes(resource.id, date),
  });

  const { mutate: submitDelete, isPending: deleteLoading } = useMutation({
    mutationFn: (id: number) => deleteAvailableTime(id),
    onSuccess: () => {
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: timesQueryKey });
    },
    // 삭제 실패 시 모달 유지
  });

  function handleDelete() {
    if (!deleteTarget) return;
    submitDelete(deleteTarget.id);
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
          <SkeletonList count={2} itemClassName="h-10 rounded-xl" className="space-y-2 mb-4" />
        ) : timesError ? (
          <p className="text-sm text-red-400 text-center py-4 mb-4">이용 시간을 불러오지 못했습니다.</p>
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
            queryClient.invalidateQueries({ queryKey: timesQueryKey });
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

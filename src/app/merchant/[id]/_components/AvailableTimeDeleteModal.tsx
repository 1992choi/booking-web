'use client';

import Modal from '@/components/ui/Modal';
import type { AvailableTime } from '@/lib/types/merchant';
import { formatTime } from './helpers';

export function AvailableTimeDeleteModal({
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

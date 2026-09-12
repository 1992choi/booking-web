import { RESERVATION_STATUS_LABELS, RESERVATION_STATUS_STYLES } from '@/lib/constants/reservation';
import type { AdminCalendarEntry } from '@/lib/types/admin';

export function EntryCard({
  entry,
  onConfirm,
  onCancel,
  disabled,
}: {
  entry: AdminCalendarEntry;
  onConfirm: () => void;
  onCancel: () => void;
  disabled: boolean;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-900 truncate">{entry.resourceName}</p>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ml-2 flex-shrink-0 ${RESERVATION_STATUS_STYLES[entry.status]}`}>
          {RESERVATION_STATUS_LABELS[entry.status]}
        </span>
      </div>
      <p className="text-xs text-gray-400 mb-3">
        {entry.startTime} ~ {entry.endTime}
      </p>
      {(entry.status === 'PENDING' || entry.status === 'CONFIRMED') && (
        <div className="flex gap-2">
          {entry.status === 'PENDING' && (
            <button
              onClick={onConfirm}
              disabled={disabled}
              className="flex-1 text-xs font-medium py-1.5 rounded-lg border border-blue-200 text-blue-500 hover:bg-blue-50 disabled:opacity-50 transition-colors"
            >
              확정
            </button>
          )}
          <button
            onClick={onCancel}
            disabled={disabled}
            className="flex-1 text-xs font-medium py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500 disabled:opacity-50 transition-colors"
          >
            취소
          </button>
        </div>
      )}
    </div>
  );
}

import { RESERVATION_STATUS_LABELS, RESERVATION_STATUS_STYLES } from '@/lib/constants/reservation';
import { formatDate, formatPrice, formatTime } from '@/lib/utils/format';
import type { ReservationStatus } from '@/lib/types/reservation';

export function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
  return (
    <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${RESERVATION_STATUS_STYLES[status]}`}>
      {RESERVATION_STATUS_LABELS[status]}
    </span>
  );
}

export function ReservationSummaryRows({
  startTime,
  endTime,
  headCount,
  amount,
}: {
  startTime: string;
  endTime: string;
  headCount: number;
  amount: number;
}) {
  return (
    <div className="border-t border-gray-50 pt-3 space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">날짜</span>
        <span className="text-gray-700 font-medium">{formatDate(startTime)}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">시간</span>
        <span className="text-gray-700 font-medium">
          {formatTime(startTime)} ~ {formatTime(endTime)}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">인원</span>
        <span className="text-gray-700 font-medium">{headCount}명</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">금액</span>
        <span className="text-blue-500 font-bold">{formatPrice(amount)}</span>
      </div>
    </div>
  );
}

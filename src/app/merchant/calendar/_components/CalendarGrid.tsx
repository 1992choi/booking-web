import { toDateKey } from '@/lib/utils/calendar';
import type { AdminCalendarData } from '@/lib/types/admin';
import type { ReservationStatus } from '@/lib/types/reservation';

const STATUS_DOT: Record<ReservationStatus, string> = {
  PENDING:   'bg-yellow-400',
  CONFIRMED: 'bg-blue-400',
  CANCELLED: 'bg-gray-300',
};

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

export function CalendarGrid({
  weeks,
  year,
  month,
  calendarData,
  todayKey,
  selectedDate,
  onSelectDate,
  isLoading,
}: {
  weeks: (number | null)[][];
  year: number;
  month: number;
  calendarData: AdminCalendarData;
  todayKey: string;
  selectedDate: string | null;
  onSelectDate: (dateKey: string) => void;
  isLoading: boolean;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-4">
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {DAY_LABELS.map((d, i) => (
          <div
            key={d}
            className={`py-2 text-center text-xs font-medium ${
              i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="text-sm text-gray-300">불러오는 중...</div>
        </div>
      ) : (
        <div>
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 border-b border-gray-50 last:border-0">
              {week.map((day, di) => {
                if (!day) return <div key={di} className="min-h-[72px] bg-gray-50/50" />;
                const dateKey = toDateKey(year, month, day);
                const entries = calendarData[dateKey] ?? [];
                const isToday = dateKey === todayKey;
                const isSelected = dateKey === selectedDate;
                const pending = entries.filter(e => e.status === 'PENDING').length;
                const confirmed = entries.filter(e => e.status === 'CONFIRMED').length;

                const summary = [
                  pending > 0 ? `대기 ${pending}건` : null,
                  confirmed > 0 ? `확정 ${confirmed}건` : null,
                ].filter(Boolean).join(', ');

                return (
                  <button
                    key={di}
                    onClick={() => onSelectDate(dateKey)}
                    aria-pressed={isSelected}
                    aria-label={`${month}월 ${day}일${summary ? `, ${summary}` : ''}`}
                    className={`min-h-[72px] p-2 text-left border-l border-gray-50 first:border-0 transition-colors ${
                      isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className={`text-xs font-medium block mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday
                        ? 'bg-blue-500 text-white'
                        : di === 0 ? 'text-red-400' : di === 6 ? 'text-blue-400' : 'text-gray-700'
                    }`}>
                      {day}
                    </span>
                    {entries.length > 0 && (
                      <div className="space-y-0.5">
                        {pending > 0 && (
                          <div className="flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT.PENDING}`} />
                            <span className="text-[10px] text-gray-500 truncate">대기 {pending}</span>
                          </div>
                        )}
                        {confirmed > 0 && (
                          <div className="flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT.CONFIRMED}`} />
                            <span className="text-[10px] text-gray-500 truncate">확정 {confirmed}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

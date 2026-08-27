'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/Header';
import { getAdminCalendar, confirmReservation, cancelReservation } from '@/lib/api/adminReservations';
import { getErrorMessage } from '@/lib/api/axios';
import { toDateKey, buildCalendarGrid, shiftMonth } from '@/lib/utils/calendar';
import type { AdminCalendarEntry, AdminCalendarData } from '@/lib/types/admin';
import type { ReservationStatus } from '@/lib/types/reservation';
import { RESERVATION_STATUS_LABELS, RESERVATION_STATUS_STYLES } from '@/lib/constants/reservation';
import { useDocumentTitle } from '@/lib/hooks/useDocumentTitle';

const STATUS_DOT: Record<ReservationStatus, string> = {
  PENDING:   'bg-yellow-400',
  CONFIRMED: 'bg-blue-400',
  CANCELLED: 'bg-gray-300',
};

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

// ─── 예약 항목 카드 ────────────────────────────────────────────────────
function EntryCard({
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

// ─── 메인 페이지 ──────────────────────────────────────────────────────
export default function AdminReservationsPage() {
  useDocumentTitle('예약 현황');
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');
  const queryClient = useQueryClient();

  const { data: calendarData = {} as AdminCalendarData, isLoading, isError } = useQuery({
    queryKey: ['admin-calendar', year, month],
    queryFn: () => getAdminCalendar(year, month),
  });

  const { mutate: changeStatus, isPending: actioning } = useMutation({
    mutationFn: ({ reservationId, action }: { reservationId: number; action: 'confirm' | 'cancel' }) =>
      action === 'confirm' ? confirmReservation(reservationId) : cancelReservation(reservationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-calendar', year, month] });
      setActionError('');
    },
    onError: (err) => setActionError(getErrorMessage(err)),
  });

  function prevMonth() {
    const shifted = shiftMonth(year, month, -1);
    setYear(shifted.year);
    setMonth(shifted.month);
    setSelectedDate(null);
  }

  function nextMonth() {
    const shifted = shiftMonth(year, month, 1);
    setYear(shifted.year);
    setMonth(shifted.month);
    setSelectedDate(null);
  }

  const weeks = buildCalendarGrid(year, month);
  const todayKey = toDateKey(today.getFullYear(), today.getMonth() + 1, today.getDate());
  const selectedEntries = selectedDate ? (calendarData[selectedDate] ?? []) : [];

  return (
    <>
      <Header />

      <main className="max-w-screen-md mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 mb-6">예약 현황</h1>

        {/* 월 네비게이션 */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            aria-label="이전 달"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            ‹
          </button>
          <span className="text-base font-semibold text-gray-800">
            {year}년 {month}월
          </span>
          <button
            onClick={nextMonth}
            aria-label="다음 달"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            ›
          </button>
        </div>

        {isError && (
          <p className="text-sm text-red-400 text-center py-16">캘린더를 불러오지 못했습니다.</p>
        )}

        {!isError && (
          <>
            {/* 캘린더 */}
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
                            onClick={() => setSelectedDate(isSelected ? null : dateKey)}
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

            {/* 선택된 날짜 상세 */}
            {selectedDate && (
              <div>
                <h2 className="text-sm font-semibold text-gray-700 mb-3">
                  {selectedDate.replace(/-/g, '.')} 예약 목록
                </h2>

                {actionError && (
                  <p className="text-sm text-red-400 text-center mb-3">{actionError}</p>
                )}

                {selectedEntries.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">예약 내역이 없습니다.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedEntries.map((entry) => (
                      <EntryCard
                        key={entry.reservationId}
                        entry={entry}
                        disabled={actioning}
                        onConfirm={() => changeStatus({ reservationId: entry.reservationId, action: 'confirm' })}
                        onCancel={() => changeStatus({ reservationId: entry.reservationId, action: 'cancel' })}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}

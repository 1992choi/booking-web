'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/Header';
import MonthNav from '@/components/ui/MonthNav';
import { EmptyText, ErrorText } from '@/components/ui/StatusMessage';
import { getAdminCalendar, confirmReservation, cancelReservation } from '@/lib/api/adminReservations';
import { getErrorMessage } from '@/lib/api/axios';
import { toDateKey, buildCalendarGrid } from '@/lib/utils/calendar';
import type { AdminCalendarData } from '@/lib/types/admin';
import { useDocumentTitle } from '@/lib/hooks/useDocumentTitle';
import { useMonthNavigation } from '@/lib/hooks/useMonthNavigation';
import { CalendarGrid } from './_components/CalendarGrid';
import { EntryCard } from './_components/EntryCard';

export default function AdminReservationsPage() {
  useDocumentTitle('예약 현황');
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { year, month, prevMonth, nextMonth } = useMonthNavigation(() => setSelectedDate(null));
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

  const weeks = buildCalendarGrid(year, month);
  const todayKey = toDateKey(today.getFullYear(), today.getMonth() + 1, today.getDate());
  const selectedEntries = selectedDate ? (calendarData[selectedDate] ?? []) : [];

  return (
    <>
      <Header />

      <main className="max-w-screen-md mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 mb-6">예약 현황</h1>

        <MonthNav year={year} month={month} onPrev={prevMonth} onNext={nextMonth} className="mb-4" />

        {isError && (
          <ErrorText className="py-16">캘린더를 불러오지 못했습니다.</ErrorText>
        )}

        {!isError && (
          <>
            <CalendarGrid
              weeks={weeks}
              year={year}
              month={month}
              calendarData={calendarData}
              todayKey={todayKey}
              selectedDate={selectedDate}
              onSelectDate={(dateKey) => setSelectedDate((prev) => (prev === dateKey ? null : dateKey))}
              isLoading={isLoading}
            />

            {/* 선택된 날짜 상세 */}
            {selectedDate && (
              <div>
                <h2 className="text-sm font-semibold text-gray-700 mb-3">
                  {selectedDate.replace(/-/g, '.')} 예약 목록
                </h2>

                {actionError && (
                  <ErrorText className="mb-3">{actionError}</ErrorText>
                )}

                {selectedEntries.length === 0 ? (
                  <EmptyText className="py-8">예약 내역이 없습니다.</EmptyText>
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

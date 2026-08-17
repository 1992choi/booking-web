'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import BackButton from '@/components/ui/BackButton';
import { getMyReservations } from '@/lib/api/reservations';
import { RESERVATION_STATUS_TABS } from '@/lib/constants/reservation';
import { ReservationStatusBadge, ReservationSummaryRows } from '@/components/ReservationSummary';
import type { Reservation, ReservationStatus } from '@/lib/types/reservation';
import { useDocumentTitle } from '@/lib/hooks/useDocumentTitle';

function ReservationCard({ reservation }: { reservation: Reservation }) {
  return (
    <Link
      href={`/my/reservations/${reservation.id}`}
      className="block bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-200 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-base font-semibold text-gray-900 truncate">{reservation.resourceName}</h3>
        <ReservationStatusBadge status={reservation.status} />
      </div>

      <ReservationSummaryRows
        startTime={reservation.startTime}
        endTime={reservation.endTime}
        headCount={reservation.headCount}
        amount={reservation.amount}
      />
    </Link>
  );
}

export default function MyReservationsPage() {
  useDocumentTitle('내 예약');
  const [tab, setTab] = useState<ReservationStatus | 'ALL'>('ALL');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [isLast, setIsLast] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError('');
    setPage(0);

    getMyReservations(tab === 'ALL' ? undefined : tab, 0)
      .then((res) => {
        setReservations(res.content);
        setIsLast(res.page >= res.totalPages - 1);
      })
      .catch(() => setError('예약 목록을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [tab]);

  function loadMore() {
    const next = page + 1;
    getMyReservations(tab === 'ALL' ? undefined : tab, next)
      .then((res) => {
        setReservations((prev) => [...prev, ...res.content]);
        setIsLast(res.page >= res.totalPages - 1);
        setPage(next);
      })
      .catch(() => setError('불러오기에 실패했습니다.'));
  }

  return (
    <>
      <Header />

      <main className="max-w-screen-sm mx-auto px-4 py-6">
        <BackButton />

        <h1 className="text-xl font-bold text-gray-900 mb-5">내 예약</h1>

        {/* 상태 필터 탭 */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {RESERVATION_STATUS_TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`flex-shrink-0 text-sm font-medium px-4 py-1.5 rounded-full border transition-colors ${
                tab === t.value
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-500'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && error && (
          <p className="text-sm text-red-400 text-center py-16">{error}</p>
        )}

        {!loading && !error && reservations.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-16">예약 내역이 없습니다.</p>
        )}

        {!loading && !error && reservations.length > 0 && (
          <>
            <div className="space-y-3">
              {reservations.map((r) => (
                <ReservationCard key={r.id} reservation={r} />
              ))}
            </div>

            {!isLast && (
              <button
                onClick={loadMore}
                className="mt-5 w-full text-sm text-gray-500 border border-gray-200 rounded-xl py-3 hover:border-blue-300 hover:text-blue-500 transition-colors"
              >
                더 보기
              </button>
            )}
          </>
        )}
      </main>
    </>
  );
}

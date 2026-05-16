'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { getMyReservations } from '@/lib/api/reservations';
import type { Reservation, ReservationStatus } from '@/lib/types/reservation';

const STATUS_TABS: { value: ReservationStatus | 'ALL'; label: string }[] = [
  { value: 'ALL',       label: '전체' },
  { value: 'PENDING',   label: '대기 중' },
  { value: 'CONFIRMED', label: '확정' },
  { value: 'CANCELLED', label: '취소' },
];

const STATUS_STYLES: Record<ReservationStatus, string> = {
  PENDING:   'bg-yellow-50 text-yellow-600',
  CONFIRMED: 'bg-blue-50 text-blue-600',
  CANCELLED: 'bg-gray-100 text-gray-400',
};

const STATUS_LABELS: Record<ReservationStatus, string> = {
  PENDING:   '대기 중',
  CONFIRMED: '확정',
  CANCELLED: '취소',
};

function formatPrice(price: number) {
  return price.toLocaleString('ko-KR') + '원';
}

function formatTime(isoString: string) {
  const d = new Date(isoString);
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDate(isoString: string) {
  const d = new Date(isoString);
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

function ReservationCard({ reservation }: { reservation: Reservation }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-200 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-base font-semibold text-gray-900 truncate">{reservation.resourceName}</h3>
        <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[reservation.status]}`}>
          {STATUS_LABELS[reservation.status]}
        </span>
      </div>

      <div className="border-t border-gray-50 pt-3 space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">날짜</span>
          <span className="text-gray-700 font-medium">{formatDate(reservation.startTime)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">시간</span>
          <span className="text-gray-700 font-medium">
            {formatTime(reservation.startTime)} ~ {formatTime(reservation.endTime)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">인원</span>
          <span className="text-gray-700 font-medium">{reservation.headCount}명</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">금액</span>
          <span className="text-blue-500 font-bold">{formatPrice(reservation.amount)}</span>
        </div>
      </div>
    </div>
  );
}

export default function MyReservationsPage() {
  const router = useRouter();
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
        setIsLast(res.last);
      })
      .catch(() => setError('예약 목록을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [tab]);

  function loadMore() {
    const next = page + 1;
    getMyReservations(tab === 'ALL' ? undefined : tab, next)
      .then((res) => {
        setReservations((prev) => [...prev, ...res.content]);
        setIsLast(res.last);
        setPage(next);
      })
      .catch(() => setError('불러오기에 실패했습니다.'));
  }

  return (
    <>
      <Header />

      <main className="max-w-screen-sm mx-auto px-4 py-6">
        {/* 뒤로가기 */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-5 transition-colors"
        >
          ← 돌아가기
        </button>

        <h1 className="text-xl font-bold text-gray-900 mb-5">내 예약</h1>

        {/* 상태 필터 탭 */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {STATUS_TABS.map((t) => (
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

        {/* 로딩 */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        )}

        {/* 에러 */}
        {!loading && error && (
          <p className="text-sm text-red-400 text-center py-16">{error}</p>
        )}

        {/* 빈 목록 */}
        {!loading && !error && reservations.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-16">예약 내역이 없습니다.</p>
        )}

        {/* 목록 */}
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
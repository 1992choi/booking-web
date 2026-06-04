'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/Header';
import BackButton from '@/components/ui/BackButton';
import { getMerchantReservations } from '@/lib/api/merchantReservations';
import { confirmReservation, cancelReservation } from '@/lib/api/adminReservations';
import { getErrorMessage } from '@/lib/api/axios';
import {
  RESERVATION_STATUS_LABELS,
  RESERVATION_STATUS_STYLES,
  RESERVATION_STATUS_TABS,
} from '@/lib/constants/reservation';
import { formatDate, formatPrice, formatTime } from '@/lib/utils/format';
import type { MerchantReservation, ReservationStatus } from '@/lib/types/reservation';

type Action = 'confirm' | 'cancel';

function ReservationCard({
  reservation,
  onAction,
  disabled,
}: {
  reservation: MerchantReservation;
  onAction: (action: Action) => void;
  disabled: boolean;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="text-base font-semibold text-gray-900 truncate">{reservation.resourceName}</p>
          <p className="text-xs text-gray-400 mt-0.5">{reservation.userName ?? '—'}</p>
        </div>
        <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${RESERVATION_STATUS_STYLES[reservation.status]}`}>
          {RESERVATION_STATUS_LABELS[reservation.status]}
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

      {(reservation.status === 'PENDING' || reservation.status === 'CONFIRMED') && (
        <div className="flex gap-2 mt-4 pt-3 border-t border-gray-50">
          {reservation.status === 'PENDING' && (
            <button
              onClick={() => onAction('confirm')}
              disabled={disabled}
              className="flex-1 text-sm font-medium py-2 rounded-xl border border-blue-200 text-blue-500 hover:bg-blue-50 disabled:opacity-50 transition-colors"
            >
              확정
            </button>
          )}
          <button
            onClick={() => onAction('cancel')}
            disabled={disabled}
            className="flex-1 text-sm font-medium py-2 rounded-xl border border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500 disabled:opacity-50 transition-colors"
          >
            취소
          </button>
        </div>
      )}
    </div>
  );
}

export default function MerchantReservationsPage() {
  const { id } = useParams<{ id: string }>();
  const merchantId = Number(id);
  const router = useRouter();
  const [tab, setTab] = useState<ReservationStatus | 'ALL'>('ALL');
  const [actionError, setActionError] = useState('');
  const queryClient = useQueryClient();

  const { data: reservations = [], isLoading, isError } = useQuery({
    queryKey: ['merchant-reservations', merchantId, tab],
    queryFn: async () => {
      if (tab === 'ALL') {
        const [pending, confirmed, cancelled] = await Promise.all([
          getMerchantReservations(merchantId, 'PENDING'),
          getMerchantReservations(merchantId, 'CONFIRMED'),
          getMerchantReservations(merchantId, 'CANCELLED'),
        ]);
        return [...pending.content, ...confirmed.content, ...cancelled.content];
      }
      const res = await getMerchantReservations(merchantId, tab);
      return res.content;
    },
  });

  const { mutate: changeStatus, isPending: isMutating } = useMutation({
    mutationFn: ({ id, action }: { id: number; action: Action }) =>
      action === 'confirm' ? confirmReservation(id) : cancelReservation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-reservations', merchantId] });
      setActionError('');
    },
    onError: (err) => setActionError(getErrorMessage(err)),
  });

  return (
    <>
      <Header />

      <main className="max-w-screen-sm mx-auto px-4 py-6">
        <BackButton />

        <h1 className="text-xl font-bold text-gray-900 mb-5">예약 관리</h1>

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

        {actionError && (
          <p className="text-sm text-red-400 text-center mb-4">{actionError}</p>
        )}

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && isError && (
          <p className="text-sm text-red-400 text-center py-16">예약 목록을 불러오지 못했습니다.</p>
        )}

        {!isLoading && !isError && reservations.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-16">예약 내역이 없습니다.</p>
        )}

        {!isLoading && !isError && reservations.length > 0 && (
          <div className="space-y-3">
            {reservations.map((r) => (
              <ReservationCard
                key={r.id}
                reservation={r}
                disabled={isMutating}
                onAction={(action) => changeStatus({ id: r.id, action })}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

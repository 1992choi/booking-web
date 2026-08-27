'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/Header';
import BackButton from '@/components/ui/BackButton';
import Row from '@/components/ui/Row';
import axios from 'axios';
import { cancelReservation, getReservation } from '@/lib/api/reservations';
import { getErrorMessage } from '@/lib/api/axios';
import { getPayment, refund } from '@/lib/api/payments';
import { createReview } from '@/lib/api/reviews';
import {
  RESERVATION_STATUS_LABELS,
  RESERVATION_STATUS_STYLES,
} from '@/lib/constants/reservation';
import { formatDate, formatPrice, formatTime } from '@/lib/utils/format';
import type { Reservation } from '@/lib/types/reservation';
import type { Payment, PaymentStatus } from '@/lib/types/payment';
import type { ApiError } from '@/lib/types/common';
import { useDocumentTitle } from '@/lib/hooks/useDocumentTitle';

const PAYMENT_STATUS_STYLES: Record<PaymentStatus, string> = {
  PENDING:   'bg-yellow-50 text-yellow-600',
  COMPLETED: 'bg-green-50 text-green-600',
  FAILED:    'bg-red-50 text-red-500',
  REFUNDED:  'bg-gray-100 text-gray-400',
};

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING:   '결제 대기',
  COMPLETED: '결제 완료',
  FAILED:    '결제 실패',
  REFUNDED:  '환불 완료',
};

export default function ReservationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const numId = Number(id);
  const queryClient = useQueryClient();

  const { data: reservation, isLoading: reservationLoading, isError: error } = useQuery({
    queryKey: ['reservation', id],
    queryFn: () => getReservation(numId),
  });
  useDocumentTitle(reservation ? reservation.resourceName : '예약 상세');

  const { data: payment, isLoading: paymentLoading } = useQuery({
    queryKey: ['payment', id],
    queryFn: () => getPayment(numId).catch(() => null),
  });

  const loading = reservationLoading || paymentLoading;

  const [actionError, setActionError] = useState('');

  const [reviewContent, setReviewContent] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewDone, setReviewDone] = useState(false);

  const { mutate: submitCancel, isPending: cancelLoading } = useMutation({
    mutationFn: () => cancelReservation(numId),
    onSuccess: () => {
      queryClient.setQueryData(['reservation', id], (prev: Reservation | undefined) =>
        prev ? { ...prev, status: 'CANCELLED' as const } : prev
      );
      setActionError('');
    },
    onError: (err) => setActionError(getErrorMessage(err)),
  });

  const { mutate: submitRefund, isPending: refundLoading } = useMutation({
    mutationFn: () => refund(numId),
    onSuccess: () => {
      queryClient.setQueryData(['payment', id], (prev: Payment | null | undefined) =>
        prev ? { ...prev, status: 'REFUNDED' as const } : prev
      );
      setActionError('');
    },
    onError: (err) => setActionError(getErrorMessage(err)),
  });

  const actionLoading = cancelLoading || refundLoading;

  const { mutate: submitReview, isPending: reviewSubmitting } = useMutation({
    mutationFn: (content: string) => createReview({ reservationId: numId, content }),
    onSuccess: () => {
      setReviewDone(true);
      setReviewError('');
    },
    onError: (err) => {
      if (axios.isAxiosError(err) && (err.response?.data as ApiError | undefined)?.code === 'REVIEW_003') {
        setReviewDone(true);
      } else {
        setReviewError(getErrorMessage(err));
      }
    },
  });

  function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewContent.trim()) return;
    setReviewError('');
    submitReview(reviewContent.trim());
  }

  const canCancel = reservation?.status === 'PENDING' || reservation?.status === 'CONFIRMED';
  const canRefund = payment?.status === 'COMPLETED' && reservation?.status === 'CANCELLED';

  return (
    <>
      <Header />

      <main className="max-w-screen-sm mx-auto px-4 py-6">
        <BackButton label="내 예약" />

        {loading && (
          <div className="space-y-3">
            <div className="h-8 w-40 bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
            <div className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
          </div>
        )}

        {!loading && error && (
          <p className="text-sm text-red-400 text-center py-20">예약 정보를 불러오지 못했습니다.</p>
        )}

        {!loading && !error && reservation && (
          <>
            {/* 예약 정보 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
              <div className="flex items-start justify-between gap-3 mb-4">
                <h2 className="text-lg font-bold text-gray-900">{reservation.resourceName}</h2>
                <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${RESERVATION_STATUS_STYLES[reservation.status]}`}>
                  {RESERVATION_STATUS_LABELS[reservation.status]}
                </span>
              </div>
              <div>
                <Row label="날짜">{formatDate(reservation.startTime)}</Row>
                <Row label="시간">{formatTime(reservation.startTime)} ~ {formatTime(reservation.endTime)}</Row>
                <Row label="인원">{reservation.headCount}명</Row>
                <Row label="금액">
                  <span className="text-blue-500">{formatPrice(reservation.amount)}</span>
                </Row>
              </div>
            </div>

            {/* 결제 정보 */}
            {payment && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">결제 정보</h3>
                <div>
                  <Row label="결제 금액">{formatPrice(payment.amount)}</Row>
                  <Row label="결제 상태">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PAYMENT_STATUS_STYLES[payment.status]}`}>
                      {PAYMENT_STATUS_LABELS[payment.status]}
                    </span>
                  </Row>
                </div>
              </div>
            )}

            {/* 이용 후기 */}
            {reservation.status === 'CONFIRMED' && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">이용 후기</h3>
                {reviewDone ? (
                  <p className="text-sm text-gray-400 text-center py-4">리뷰가 등록되었습니다. 감사합니다!</p>
                ) : (
                  <form onSubmit={handleSubmitReview}>
                    <label htmlFor="review-content" className="sr-only">
                      이용 후기
                    </label>
                    <textarea
                      id="review-content"
                      value={reviewContent}
                      onChange={(e) => setReviewContent(e.target.value)}
                      placeholder="이용하신 소감을 남겨주세요."
                      rows={3}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    {reviewError && <p className="text-sm text-red-400 mt-2">{reviewError}</p>}
                    <button
                      type="submit"
                      disabled={reviewSubmitting || !reviewContent.trim()}
                      className="mt-3 w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium rounded-xl py-2.5 transition-colors"
                    >
                      {reviewSubmitting ? '등록 중...' : '리뷰 등록'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* 액션 버튼 */}
            {actionError && (
              <p className="text-sm text-red-400 text-center mb-3">{actionError}</p>
            )}
            {canCancel && (
              <button
                onClick={() => submitCancel()}
                disabled={actionLoading}
                className="w-full border border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 disabled:opacity-50 text-sm font-medium rounded-xl py-3 transition-colors"
              >
                {actionLoading ? '처리 중...' : '예약 취소'}
              </button>
            )}
            {canRefund && (
              <button
                onClick={() => submitRefund()}
                disabled={actionLoading}
                className="w-full border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-500 disabled:opacity-50 text-sm font-medium rounded-xl py-3 transition-colors mt-2"
              >
                {actionLoading ? '처리 중...' : '환불 요청'}
              </button>
            )}
          </>
        )}
      </main>
    </>
  );
}

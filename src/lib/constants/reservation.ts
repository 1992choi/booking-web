import type { ReservationStatus } from '@/lib/types/reservation';

export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  PENDING:   '대기 중',
  CONFIRMED: '확정',
  CANCELLED: '취소',
};

export const RESERVATION_STATUS_STYLES: Record<ReservationStatus, string> = {
  PENDING:   'bg-yellow-50 text-yellow-600',
  CONFIRMED: 'bg-blue-50 text-blue-600',
  CANCELLED: 'bg-gray-100 text-gray-400',
};

export const RESERVATION_STATUS_TABS: { value: ReservationStatus | 'ALL'; label: string }[] = [
  { value: 'ALL',       label: '전체' },
  { value: 'PENDING',   label: '대기 중' },
  { value: 'CONFIRMED', label: '확정' },
  { value: 'CANCELLED', label: '취소' },
];

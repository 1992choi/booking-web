import type { AvailableTime } from '@/lib/types/merchant';

export const STATUS_LABELS: Record<AvailableTime['status'], string> = {
  OPEN:    '예약 가능',
  BLOCKED: '차단',
};

export const STATUS_COLORS: Record<AvailableTime['status'], string> = {
  OPEN:    'bg-green-50 text-green-600',
  BLOCKED: 'bg-red-50 text-red-500',
};

export function formatTime(dt: string) {
  return dt.slice(11, 16);
}

export function toDatetimeLocal(dt: string) {
  return dt.slice(0, 16);
}

export function toBackendTime(dt: string) {
  return dt + ':00';
}

export function todayString() {
  return new Date().toISOString().slice(0, 10);
}

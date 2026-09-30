import type { NotificationType } from '@/lib/types/notification';

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  CONFIRMED:     '예약 확정',
  CANCELLED:     '예약 취소',
  ADMIN_MESSAGE: '관리자 메시지',
};

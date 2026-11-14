import { cva } from 'class-variance-authority';
import type { PaymentStatus } from '@/lib/types/payment';

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING:   '결제 대기',
  COMPLETED: '결제 완료',
  FAILED:    '결제 실패',
  REFUNDED:  '환불 완료',
};

export const paymentStatusBadgeVariants = cva('text-xs font-semibold px-2 py-0.5 rounded-full', {
  variants: {
    status: {
      PENDING:   'bg-yellow-50 text-yellow-600',
      COMPLETED: 'bg-green-50 text-green-600',
      FAILED:    'bg-red-50 text-red-500',
      REFUNDED:  'bg-gray-100 text-gray-400',
    } satisfies Record<PaymentStatus, string>,
  },
});

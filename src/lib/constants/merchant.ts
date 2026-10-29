import { cva } from 'class-variance-authority';
import type { MerchantType } from '@/lib/types/merchant';

export const MERCHANT_TYPE_LABELS: Record<MerchantType, string> = {
  PENSION:  '펜션',
  CLASS:    '클래스',
  FACILITY: '시설',
};

export const merchantTypeBadgeVariants = cva('text-xs font-semibold px-2 py-0.5 rounded-full', {
  variants: {
    type: {
      PENSION:  'bg-blue-50 text-blue-600',
      CLASS:    'bg-green-50 text-green-600',
      FACILITY: 'bg-purple-50 text-purple-600',
    } satisfies Record<MerchantType, string>,
  },
});

export const MERCHANT_TYPE_OPTIONS: { value: MerchantType; label: string }[] = [
  { value: 'PENSION',  label: '펜션' },
  { value: 'CLASS',    label: '클래스' },
  { value: 'FACILITY', label: '시설' },
];

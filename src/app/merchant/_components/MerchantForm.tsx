'use client';

import type { UseFormReturn } from 'react-hook-form';
import type { z } from 'zod';
import { MERCHANT_TYPE_OPTIONS } from '@/lib/constants/merchant';
import { merchantSchema } from '@/lib/validation/merchant';

export type MerchantFormValues = z.infer<typeof merchantSchema>;

export function MerchantForm({
  form,
  onSubmit,
  errorMsg,
  submitting,
  submitLabel,
  submittingLabel,
}: {
  form: UseFormReturn<MerchantFormValues>;
  onSubmit: (values: MerchantFormValues) => void;
  errorMsg: string;
  submitting: boolean;
  submitLabel: string;
  submittingLabel: string;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const type = watch('type');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <label htmlFor="merchant-name" className="block text-xs font-medium text-gray-500 mb-1.5">
          업체명
        </label>
        <input
          {...register('name')}
          id="merchant-name"
          type="text"
          placeholder="업체명을 입력하세요"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'merchant-name-error' : undefined}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.name && (
          <p id="merchant-name-error" className="mt-1 text-xs text-red-500">
            {errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="merchant-phone" className="block text-xs font-medium text-gray-500 mb-1.5">
          전화번호
        </label>
        <input
          {...register('phone')}
          id="merchant-phone"
          type="tel"
          placeholder="010-0000-0000"
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? 'merchant-phone-error' : undefined}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.phone && (
          <p id="merchant-phone-error" className="mt-1 text-xs text-red-500">
            {errors.phone.message}
          </p>
        )}
      </div>

      <div role="group" aria-labelledby="merchant-type-label">
        <label id="merchant-type-label" className="block text-xs font-medium text-gray-500 mb-1.5">
          업체 유형
        </label>
        <div className="grid grid-cols-2 gap-2">
          {MERCHANT_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              aria-pressed={type === opt.value}
              onClick={() => setValue('type', opt.value, { shouldValidate: true })}
              className={`py-3 rounded-xl text-sm font-medium border transition-colors ${
                type === opt.value
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && <p className="text-sm text-red-400 text-center">{errorMsg}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium rounded-xl py-3 transition-colors"
      >
        {submitting ? submittingLabel : submitLabel}
      </button>
    </form>
  );
}

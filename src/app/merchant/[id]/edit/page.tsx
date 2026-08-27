'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import BackButton from '@/components/ui/BackButton';
import { getMerchant, updateMerchant } from '@/lib/api/merchants';
import { getErrorMessage } from '@/lib/api/axios';
import { MERCHANT_TYPE_OPTIONS } from '@/lib/constants/merchant';
import { merchantSchema } from '@/lib/validation/merchant';
import { useDocumentTitle } from '@/lib/hooks/useDocumentTitle';

type FormValues = z.infer<typeof merchantSchema>;

export default function MerchantEditPage() {
  useDocumentTitle('업체 수정');
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(merchantSchema),
    defaultValues: { type: 'PENSION' },
  });

  const type = watch('type');

  const { data: merchant, isLoading: initialLoading, isError: loadError } = useQuery({
    queryKey: ['merchant', id],
    queryFn: () => getMerchant(Number(id)),
  });

  useEffect(() => {
    if (!merchant) return;
    reset({ name: merchant.name, phone: merchant.phone, type: merchant.type });
  }, [merchant, reset]);

  const { mutate: submitUpdate, isPending: isSubmitting } = useMutation({
    mutationFn: (values: FormValues) => updateMerchant(Number(id), values),
    onSuccess: () => router.push(`/merchant/${id}`),
    onError: (err) => setErrorMsg(getErrorMessage(err)),
  });

  const onSubmit = (values: FormValues) => {
    setErrorMsg('');
    submitUpdate(values);
  };

  return (
    <>
      <Header />

      <main className="max-w-screen-sm mx-auto px-4 py-6">
        <BackButton />

        <h1 className="text-xl font-bold text-gray-900 mb-6">업체 수정</h1>

        {initialLoading ? (
          <div className="space-y-4">
            <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          </div>
        ) : loadError ? (
          <p className="text-sm text-red-400 text-center py-16">업체 정보를 불러오지 못했습니다.</p>
        ) : (
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
              disabled={isSubmitting}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium rounded-xl py-3 transition-colors"
            >
              {isSubmitting ? '저장 중...' : '수정 완료'}
            </button>
          </form>
        )}
      </main>
    </>
  );
}

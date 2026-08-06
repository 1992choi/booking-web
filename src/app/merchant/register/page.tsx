'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import BackButton from '@/components/ui/BackButton';
import { createMerchant } from '@/lib/api/merchants';
import { getErrorMessage } from '@/lib/api/axios';
import { MERCHANT_TYPE_OPTIONS } from '@/lib/constants/merchant';
import { merchantSchema } from '@/lib/validation/merchant';

type FormValues = z.infer<typeof merchantSchema>;

export default function MerchantRegisterPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(merchantSchema),
    defaultValues: { type: 'PENSION' },
  });

  const type = watch('type');

  const onSubmit = async (values: FormValues) => {
    setErrorMsg('');
    try {
      await createMerchant(values);
      router.push('/merchant/dashboard');
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    }
  };

  return (
    <>
      <Header />

      <main className="max-w-screen-sm mx-auto px-4 py-6">
        <BackButton />

        <h1 className="text-xl font-bold text-gray-900 mb-6">업체 등록</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">업체명</label>
            <input
              {...register('name')}
              type="text"
              placeholder="업체명을 입력하세요"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">전화번호</label>
            <input
              {...register('phone')}
              type="tel"
              placeholder="010-0000-0000"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">업체 유형</label>
            <div className="grid grid-cols-2 gap-2">
              {MERCHANT_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
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
            {isSubmitting ? '등록 중...' : '업체 등록'}
          </button>
        </form>
      </main>
    </>
  );
}

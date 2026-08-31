'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import BackButton from '@/components/ui/BackButton';
import { getMerchant, updateMerchant } from '@/lib/api/merchants';
import { getErrorMessage } from '@/lib/api/axios';
import { merchantSchema } from '@/lib/validation/merchant';
import { useDocumentTitle } from '@/lib/hooks/useDocumentTitle';
import { MerchantForm, type MerchantFormValues } from '../../_components/MerchantForm';

export default function MerchantEditPage() {
  useDocumentTitle('업체 수정');
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [errorMsg, setErrorMsg] = useState('');

  const form = useForm<MerchantFormValues>({
    resolver: zodResolver(merchantSchema),
    defaultValues: { type: 'PENSION' },
  });
  const { reset } = form;

  const { data: merchant, isLoading: initialLoading, isError: loadError } = useQuery({
    queryKey: ['merchant', id],
    queryFn: () => getMerchant(Number(id)),
  });

  useEffect(() => {
    if (!merchant) return;
    reset({ name: merchant.name, phone: merchant.phone, type: merchant.type });
  }, [merchant, reset]);

  const { mutate: submitUpdate, isPending: isSubmitting } = useMutation({
    mutationFn: (values: MerchantFormValues) => updateMerchant(Number(id), values),
    onSuccess: () => router.push(`/merchant/${id}`),
    onError: (err) => setErrorMsg(getErrorMessage(err)),
  });

  const onSubmit = (values: MerchantFormValues) => {
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
          <MerchantForm
            form={form}
            onSubmit={onSubmit}
            errorMsg={errorMsg}
            submitting={isSubmitting}
            submitLabel="수정 완료"
            submittingLabel="저장 중..."
          />
        )}
      </main>
    </>
  );
}

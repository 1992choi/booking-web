'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import BackButton from '@/components/ui/BackButton';
import { createMerchant } from '@/lib/api/merchants';
import { getErrorMessage } from '@/lib/api/axios';
import { merchantSchema } from '@/lib/validation/merchant';
import { useDocumentTitle } from '@/lib/hooks/useDocumentTitle';
import { MerchantForm, type MerchantFormValues } from '../_components/MerchantForm';

export default function MerchantRegisterPage() {
  useDocumentTitle('업체 등록');
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState('');

  const form = useForm<MerchantFormValues>({
    resolver: zodResolver(merchantSchema),
    defaultValues: { type: 'PENSION' },
  });

  const onSubmit = async (values: MerchantFormValues) => {
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

        <MerchantForm
          form={form}
          onSubmit={onSubmit}
          errorMsg={errorMsg}
          submitting={form.formState.isSubmitting}
          submitLabel="업체 등록"
          submittingLabel="등록 중..."
        />
      </main>
    </>
  );
}

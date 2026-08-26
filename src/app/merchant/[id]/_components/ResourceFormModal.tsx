'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { createResource, updateResource } from '@/lib/api/resources';
import { getErrorMessage } from '@/lib/api/axios';
import Modal, { ModalHeader } from '@/components/ui/Modal';
import { resourceSchema } from '@/lib/validation/merchant';
import type { Resource } from '@/lib/types/merchant';

type ResourceFormValues = z.infer<typeof resourceSchema>;

export function ResourceFormModal({
  merchantId,
  initial,
  onClose,
  onSaved,
  onDelete,
}: {
  merchantId: number;
  initial: Resource | null;
  onClose: () => void;
  onSaved: (resource: Resource) => void;
  onDelete?: () => void;
}) {
  const isEdit = initial !== null;
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      name: initial?.name ?? '',
      description: initial?.description ?? '',
      price: initial?.price ?? 0,
      maxCapacity: initial?.maxCapacity ?? 1,
    },
  });

  const onSubmit = async (values: ResourceFormValues) => {
    setErrorMsg('');
    try {
      const saved = isEdit
        ? await updateResource(initial!.id, values)
        : await createResource(merchantId, values);
      onSaved(saved);
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    }
  };

  return (
    <Modal onClose={onClose} labelId="resource-form-title">
      <ModalHeader
        id="resource-form-title"
        title={isEdit ? '예약 대상 수정' : '예약 대상 추가'}
        onClose={onClose}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label htmlFor="resource-name" className="block text-xs font-medium text-gray-500 mb-1.5">
            이름
          </label>
          <input
            {...register('name')}
            id="resource-name"
            type="text"
            placeholder="예: A동, 오전반, 1번 코트"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'resource-name-error' : undefined}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.name && (
            <p id="resource-name-error" className="mt-1 text-xs text-red-500">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="resource-description" className="block text-xs font-medium text-gray-500 mb-1.5">
            설명 (선택)
          </label>
          <input
            {...register('description')}
            id="resource-description"
            type="text"
            placeholder="간단한 설명을 입력하세요"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="resource-price" className="block text-xs font-medium text-gray-500 mb-1.5">
              가격 (원)
            </label>
            <input
              {...register('price')}
              id="resource-price"
              type="number"
              placeholder="0"
              min={0}
              aria-invalid={!!errors.price}
              aria-describedby={errors.price ? 'resource-price-error' : undefined}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.price && (
              <p id="resource-price-error" className="mt-1 text-xs text-red-500">
                {errors.price.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="resource-maxCapacity" className="block text-xs font-medium text-gray-500 mb-1.5">
              최대 인원
            </label>
            <input
              {...register('maxCapacity')}
              id="resource-maxCapacity"
              type="number"
              placeholder="1"
              min={1}
              aria-invalid={!!errors.maxCapacity}
              aria-describedby={errors.maxCapacity ? 'resource-maxCapacity-error' : undefined}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.maxCapacity && (
              <p id="resource-maxCapacity-error" className="mt-1 text-xs text-red-500">
                {errors.maxCapacity.message}
              </p>
            )}
          </div>
        </div>

        {errorMsg && <p className="text-sm text-red-400 text-center">{errorMsg}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium rounded-xl py-3 transition-colors"
        >
          {isSubmitting ? '저장 중...' : isEdit ? '수정 완료' : '추가'}
        </button>

        {isEdit && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="w-full border border-red-200 text-red-400 hover:bg-red-50 hover:text-red-500 text-sm font-medium rounded-xl py-3 transition-colors"
          >
            삭제
          </button>
        )}
      </form>
    </Modal>
  );
}

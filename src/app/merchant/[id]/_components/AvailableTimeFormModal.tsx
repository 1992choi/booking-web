'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { createAvailableTime, updateAvailableTime } from '@/lib/api/resources';
import { getErrorMessage } from '@/lib/api/axios';
import Modal, { ModalHeader } from '@/components/ui/Modal';
import { availableTimeSchema } from '@/lib/validation/merchant';
import type { AvailableTime } from '@/lib/types/merchant';
import { toBackendTime, toDatetimeLocal } from './helpers';

type AvailableTimeFormValues = z.infer<typeof availableTimeSchema>;

export function AvailableTimeFormModal({
  resourceId,
  initial,
  defaultDate,
  onClose,
  onSaved,
}: {
  resourceId: number;
  initial: AvailableTime | null;
  defaultDate: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = initial !== null;
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AvailableTimeFormValues>({
    resolver: zodResolver(availableTimeSchema),
    defaultValues: {
      startTime: initial ? toDatetimeLocal(initial.startTime) : `${defaultDate}T09:00`,
      endTime: initial ? toDatetimeLocal(initial.endTime) : `${defaultDate}T10:00`,
    },
  });

  const onSubmit = async (values: AvailableTimeFormValues) => {
    setErrorMsg('');
    try {
      if (isEdit) {
        await updateAvailableTime(initial!.id, toBackendTime(values.startTime), toBackendTime(values.endTime));
      } else {
        await createAvailableTime(resourceId, toBackendTime(values.startTime), toBackendTime(values.endTime));
      }
      onSaved();
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    }
  };

  return (
    <Modal onClose={onClose} labelId="available-time-form-title" zIndexClassName="z-[60]">
      <ModalHeader
        id="available-time-form-title"
        title={isEdit ? '이용 시간 수정' : '이용 시간 추가'}
        onClose={onClose}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label htmlFor="available-time-start" className="block text-xs font-medium text-gray-500 mb-1.5">
            시작 시간
          </label>
          <input
            {...register('startTime')}
            id="available-time-start"
            type="datetime-local"
            aria-invalid={!!errors.startTime}
            aria-describedby={errors.startTime ? 'available-time-start-error' : undefined}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.startTime && (
            <p id="available-time-start-error" className="mt-1 text-xs text-red-500">
              {errors.startTime.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="available-time-end" className="block text-xs font-medium text-gray-500 mb-1.5">
            종료 시간
          </label>
          <input
            {...register('endTime')}
            id="available-time-end"
            type="datetime-local"
            aria-invalid={!!errors.endTime}
            aria-describedby={errors.endTime ? 'available-time-end-error' : undefined}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.endTime && (
            <p id="available-time-end-error" className="mt-1 text-xs text-red-500">
              {errors.endTime.message}
            </p>
          )}
        </div>

        {errorMsg && <p className="text-sm text-red-400 text-center">{errorMsg}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium rounded-xl py-3 transition-colors"
        >
          {isSubmitting ? '저장 중...' : isEdit ? '수정 완료' : '추가'}
        </button>
      </form>
    </Modal>
  );
}

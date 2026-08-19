'use client';

import type { ReactNode } from 'react';
import { useEscapeKey } from '@/lib/hooks/useEscapeKey';

interface ModalProps {
  onClose: () => void;
  labelId: string;
  children: ReactNode;
  position?: 'center' | 'sheet';
  maxWidthClassName?: string;
  zIndexClassName?: string;
  panelClassName?: string;
}

export default function Modal({
  onClose,
  labelId,
  children,
  position = 'sheet',
  maxWidthClassName = 'sm:max-w-md',
  zIndexClassName = 'z-50',
  panelClassName = '',
}: ModalProps) {
  useEscapeKey(onClose);

  const alignClass = position === 'center' ? 'items-center' : 'items-end sm:items-center';
  const shapeClass = position === 'center' ? 'rounded-2xl' : 'rounded-t-2xl sm:rounded-2xl';

  return (
    <div
      className={`fixed inset-0 ${zIndexClassName} flex ${alignClass} justify-center`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelId}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative w-full ${maxWidthClassName} bg-white ${shapeClass} shadow-xl p-6 ${panelClassName}`}>
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({
  id,
  title,
  onClose,
}: {
  id: string;
  title: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 id={id} className="text-base font-bold text-gray-900 truncate pr-2">
        {title}
      </h2>
      <button
        onClick={onClose}
        aria-label="닫기"
        className="text-gray-400 hover:text-gray-600 text-xl leading-none flex-shrink-0"
      >
        ✕
      </button>
    </div>
  );
}

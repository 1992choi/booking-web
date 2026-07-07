'use client';

import { useToastStore } from '@/lib/store/toast';

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const dismissToast = useToastStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 inset-x-0 z-[100] flex flex-col items-center gap-2 px-4 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="alert"
          onClick={() => dismissToast(t.id)}
          className={`pointer-events-auto w-full sm:w-auto sm:max-w-sm rounded-xl px-4 py-3 shadow-lg text-sm font-medium text-white cursor-pointer whitespace-pre-line ${
            t.type === 'success' ? 'bg-gray-900' : 'bg-red-500'
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
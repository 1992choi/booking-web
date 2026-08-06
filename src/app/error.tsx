'use client';

import Header from '@/components/Header';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <>
      <Header />
      <main className="max-w-screen-sm mx-auto px-4 py-20 text-center">
        <p className="text-sm text-red-400 mb-4">문제가 발생했습니다. 잠시 후 다시 시도해 주세요.</p>
        <button
          onClick={reset}
          className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          다시 시도
        </button>
      </main>
    </>
  );
}

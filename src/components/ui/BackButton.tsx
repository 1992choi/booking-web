'use client';

import { useRouter } from 'next/navigation';

interface BackButtonProps {
  label?: string;
}

export default function BackButton({ label = '돌아가기' }: BackButtonProps) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-5 transition-colors"
    >
      ← {label}
    </button>
  );
}

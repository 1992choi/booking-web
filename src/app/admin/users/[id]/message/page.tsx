'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import Header from '@/components/Header';
import BackButton from '@/components/ui/BackButton';
import { getUsers } from '@/lib/api/auth';
import { sendNotificationToUser } from '@/lib/api/notifications';
import { getErrorMessage } from '@/lib/api/axios';

export default function SendMessagePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const userId = Number(id);

  const [message, setMessage] = useState('');

  const { data: users, isLoading: isLoadingUser } = useQuery({
    queryKey: ['admin-users', 'ALL'],
    queryFn: () => getUsers({ role: undefined }),
  });

  const user = users?.find((u) => u.id === userId);

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: () => sendNotificationToUser(userId, message),
    onSuccess: () => {
      router.back();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    mutate();
  };

  const errorMessage = isError ? getErrorMessage(error) : null;

  return (
    <>
      <Header />

      <main className="max-w-screen-sm mx-auto px-4 py-6">
        <BackButton />
        <h1 className="text-xl font-bold text-gray-900 mb-6">메시지 보내기</h1>

        {isLoadingUser ? (
          <div className="h-14 bg-gray-100 rounded-2xl animate-pulse mb-5" />
        ) : user ? (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-5">
            <p className="text-xs text-blue-400 mb-0.5">수신자</p>
            <p className="text-sm font-semibold text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
          </div>
        ) : (
          <p className="text-sm text-red-400 text-center py-8">회원 정보를 찾을 수 없습니다.</p>
        )}

        {user && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                메시지 내용
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="보낼 메시지를 입력하세요."
                rows={6}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{message.length}자</p>
            </div>

            {errorMessage && (
              <p className="text-sm text-red-500 text-center">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={isPending || !message.trim()}
              className="w-full py-3 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? '발송 중...' : '메시지 발송'}
            </button>
          </form>
        )}
      </main>
    </>
  );
}
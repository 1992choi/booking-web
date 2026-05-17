'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { getMe } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/auth';
import type { UserResponse } from '@/lib/types/auth';

const ROLE_LABELS = {
  USER:     '일반 회원',
  MERCHANT: '업체 운영자',
  ADMIN:    '관리자',
} as const;

const ROLE_COLORS = {
  USER:     'bg-gray-100 text-gray-500',
  MERCHANT: 'bg-blue-50 text-blue-600',
  ADMIN:    'bg-purple-50 text-purple-600',
} as const;

function formatDate(isoString: string) {
  return new Date(isoString).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-800">{children}</span>
    </div>
  );
}

export default function MyPage() {
  const router = useRouter();
  const { clearAuth } = useAuthStore();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => setError('정보를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  function handleLogout() {
    clearAuth();
    router.push('/login');
  }

  return (
    <>
      <Header />

      <main className="max-w-screen-sm mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 mb-6">내 정보</h1>

        {loading && (
          <div className="space-y-3">
            <div className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
            <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
          </div>
        )}

        {!loading && error && (
          <p className="text-sm text-red-400 text-center py-20">{error}</p>
        )}

        {!loading && !error && user && (
          <>
            {/* 프로필 카드 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-blue-500">{user.name[0]}</span>
                </div>
                <div>
                  <p className="text-base font-bold text-gray-900">{user.name}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_COLORS[user.role]}`}>
                    {ROLE_LABELS[user.role]}
                  </span>
                </div>
              </div>

              <div>
                <Row label="이메일">{user.email}</Row>
                <Row label="전화번호">{user.phone}</Row>
                <Row label="가입일">{formatDate(user.createdAt)}</Row>
              </div>
            </div>

            {/* 로그아웃 */}
            <button
              onClick={handleLogout}
              className="w-full border border-gray-200 text-red-400 hover:border-red-200 hover:bg-red-50 text-sm font-medium rounded-2xl py-4 transition-colors"
            >
              로그아웃
            </button>
          </>
        )}
      </main>
    </>
  );
}
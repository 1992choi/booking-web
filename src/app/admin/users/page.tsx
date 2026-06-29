'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { getUsers } from '@/lib/api/auth';
import { formatDate } from '@/lib/utils/format';
import type { Role, UserResponse } from '@/lib/types/auth';

const ROLE_LABELS: Record<Role, string> = {
  USER: '일반 회원',
  MERCHANT: '업체 운영자',
  ADMIN: '관리자',
};

const ROLE_COLORS: Record<Role, string> = {
  USER: 'bg-gray-100 text-gray-500',
  MERCHANT: 'bg-blue-50 text-blue-600',
  ADMIN: 'bg-purple-50 text-purple-600',
};

type FilterRole = Role | 'ALL';

const TABS: { label: string; value: FilterRole }[] = [
  { label: '전체', value: 'ALL' },
  { label: '일반 회원', value: 'USER' },
  { label: '업체 운영자', value: 'MERCHANT' },
  { label: '관리자', value: 'ADMIN' },
];

function UserCard({ user }: { user: UserResponse }) {
  const router = useRouter();

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-gray-900">{user.name}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_COLORS[user.role]}`}>
              {ROLE_LABELS[user.role]}
            </span>
          </div>
          <p className="text-xs text-gray-500 truncate">{user.email}</p>
          <p className="text-xs text-gray-400 mt-0.5">{user.phone}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => router.push(`/admin/users/${user.id}/message`)}
            className="p-1.5 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
            title="메시지 보내기"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </button>
          <p className="text-xs text-gray-400 whitespace-nowrap">{formatDate(user.createdAt)}</p>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [tab, setTab] = useState<FilterRole>('ALL');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-users', tab],
    queryFn: () => getUsers({ role: tab === 'ALL' ? undefined : tab }),
  });

  return (
    <>
      <Header />

      <main className="max-w-screen-sm mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-bold text-gray-900">회원 관리</h1>
          {data && (
            <span className="text-sm text-gray-400">총 {data.length.toLocaleString()}명</span>
          )}
        </div>

        {/* Role filter tabs */}
        <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1">
          {TABS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={`flex-shrink-0 text-xs font-medium px-3.5 py-1.5 rounded-full transition-colors ${
                tab === value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && isError && (
          <p className="text-sm text-red-400 text-center py-16">회원 목록을 불러오지 못했습니다.</p>
        )}

        {!isLoading && !isError && data?.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-20">해당하는 회원이 없습니다.</p>
        )}

        {!isLoading && !isError && data && data.length > 0 && (
          <div className="space-y-3">
            {data.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
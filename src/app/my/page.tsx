'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { getMe, updateMe, deleteMe } from '@/lib/api/auth';
import { getErrorMessage } from '@/lib/api/axios';
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
  const { clearAuth, updateUser } = useAuthStore();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => setError('정보를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  function startEdit() {
    if (!user) return;
    setEditName(user.name);
    setEditPhone(user.phone);
    setEditError('');
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setEditError('');
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editName.trim() || !editPhone.trim()) return;
    setEditLoading(true);
    setEditError('');
    try {
      const updated = await updateMe({ name: editName.trim(), phone: editPhone.trim() });
      setUser(updated);
      updateUser(updated);
      setEditing(false);
    } catch (err) {
      setEditError(getErrorMessage(err));
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete() {
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await deleteMe();
      clearAuth();
      router.push('/login');
    } catch (err) {
      setDeleteError(getErrorMessage(err));
      setDeleteLoading(false);
    }
  }

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
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-4">
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
                {!editing && (
                  <button
                    onClick={startEdit}
                    className="text-xs font-medium text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    수정
                  </button>
                )}
              </div>

              {editing ? (
                <form onSubmit={handleUpdate} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">이름</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">전화번호</label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      required
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="pt-1 border-t border-gray-50">
                    <Row label="이메일">{user.email}</Row>
                    <Row label="가입일">{formatDate(user.createdAt)}</Row>
                  </div>
                  {editError && <p className="text-xs text-red-400">{editError}</p>}
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      disabled={editLoading}
                      className="flex-1 text-sm font-medium py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      disabled={editLoading || !editName.trim() || !editPhone.trim()}
                      className="flex-1 text-sm font-medium py-2.5 rounded-xl bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
                    >
                      {editLoading ? '저장 중...' : '저장'}
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <Row label="이메일">{user.email}</Row>
                  <Row label="전화번호">{user.phone}</Row>
                  <Row label="가입일">{formatDate(user.createdAt)}</Row>
                </div>
              )}
            </div>

            {/* 로그아웃 */}
            <button
              onClick={handleLogout}
              className="w-full border border-gray-200 text-red-400 hover:border-red-200 hover:bg-red-50 text-sm font-medium rounded-2xl py-4 transition-colors mb-3"
            >
              로그아웃
            </button>

            {/* 회원 탈퇴 */}
            {!deleteConfirm ? (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="w-full text-xs text-gray-300 hover:text-red-400 py-2 transition-colors"
              >
                회원 탈퇴
              </button>
            ) : (
              <div className="border border-red-100 rounded-2xl p-4 bg-red-50">
                <p className="text-sm text-red-500 font-medium mb-1 text-center">정말 탈퇴하시겠어요?</p>
                <p className="text-xs text-gray-400 text-center mb-4">탈퇴 후 계정 및 모든 데이터가 삭제됩니다.</p>
                {deleteError && <p className="text-xs text-red-400 text-center mb-3">{deleteError}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={() => { setDeleteConfirm(false); setDeleteError(''); }}
                    disabled={deleteLoading}
                    className="flex-1 text-sm font-medium py-2.5 rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    className="flex-1 text-sm font-medium py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
                  >
                    {deleteLoading ? '처리 중...' : '탈퇴하기'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}

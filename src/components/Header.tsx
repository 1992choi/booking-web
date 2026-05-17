'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth';

export default function Header() {
  const router = useRouter();
  const { isAuthenticated, user, role, clearAuth } = useAuthStore();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    clearAuth();
    setOpen(false);
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-screen-lg mx-auto px-4 h-14 flex items-center justify-between">

        {/* 로고 */}
        <Link href="/" className="text-xl font-bold text-blue-500 tracking-tight">
          Bookit
        </Link>

        {/* 우측 */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {/* 프로필 드롭다운 */}
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setOpen((v) => !v)}
                  className="w-9 h-9 rounded-full bg-blue-50 hover:opacity-80 transition-opacity flex items-center justify-center"
                  aria-label="사용자 메뉴"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>

                {open && (
                  <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-gray-50">
                      <p className="text-xs text-gray-400">로그인 중</p>
                      <p className="text-sm font-medium text-gray-800 truncate">{user?.name}</p>
                    </div>
                    <Link
                      href="/my"
                      onClick={() => setOpen(false)}
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      내 정보
                    </Link>
                    <Link
                      href="/my/reservations"
                      onClick={() => setOpen(false)}
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      내 예약
                    </Link>
                    {(role === 'OWNER' || role === 'ADMIN') && (
                      <Link
                        href="/owner/dashboard"
                        onClick={() => setOpen(false)}
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-50"
                      >
                        업체 관리
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      로그아웃
                    </button>
                  </div>
                )}
              </div>

              {/* 알림 아이콘 */}
              <Link
                href="/my/notifications"
                className="w-9 h-9 rounded-full bg-blue-50 hover:opacity-80 transition-opacity flex items-center justify-center"
                aria-label="알림"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </Link>
            </>
          ) : (

            <>
              <Link href="/login" className="text-sm text-gray-600 hover:text-blue-500 transition-colors">
                로그인
              </Link>
              <Link
                href="/signup"
                className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                회원가입
              </Link>
              <Link
                href="/login"
                aria-label="로그인"
                className="w-9 h-9 rounded-full bg-gray-100 hover:opacity-80 transition-opacity flex items-center justify-center opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

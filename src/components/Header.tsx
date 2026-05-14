'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth';

export default function Header() {
  const router = useRouter();
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 바깥 클릭 시 닫기 (모바일 대응)
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
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div ref={dropdownRef} className="relative">
              {/* 유저 아이콘 버튼 */}
              <button
                onClick={() => setOpen((v) => !v)}
                onMouseEnter={() => setOpen(true)}
                className="w-9 h-9 rounded-full overflow-hidden hover:opacity-80 transition-opacity"
                aria-label="사용자 메뉴"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icons/user.webp" alt="유저" className="w-full h-full object-cover" />
              </button>

              {/* 드롭다운 */}
              {open && (
                <div
                  onMouseLeave={() => setOpen(false)}
                  className="absolute right-0 mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden"
                >
                  <div className="px-4 py-2.5 border-b border-gray-50">
                    <p className="text-xs text-gray-400">로그인 중</p>
                    <p className="text-sm font-medium text-gray-800 truncate">{user?.name}</p>
                  </div>
                  <Link
                    href="/my"
                    onClick={() => setOpen(false)}
                    className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    회원정보
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    로그아웃
                  </button>
                </div>
              )}
            </div>
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
              <Link href="/login" aria-label="로그인">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icons/user.webp" alt="유저" className="w-9 h-9 rounded-full object-cover opacity-50 hover:opacity-80 transition-opacity" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

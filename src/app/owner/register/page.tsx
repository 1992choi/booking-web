'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { createOwner } from '@/lib/api/owners';
import { getErrorMessage } from '@/lib/api/axios';
import type { OwnerType } from '@/lib/types/owner';

const TYPE_OPTIONS: { value: OwnerType; label: string }[] = [
  { value: 'PENSION',  label: '펜션' },
  { value: 'CLASS',    label: '클래스' },
  { value: 'FACILITY', label: '시설' },
];

export default function OwnerRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState<OwnerType>('PENSION');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setLoading(true);
    setError('');
    try {
      await createOwner({ name: name.trim(), phone: phone.trim(), type });
      router.push('/owner/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />

      <main className="max-w-screen-sm mx-auto px-4 py-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-5 transition-colors"
        >
          ← 돌아가기
        </button>

        <h1 className="text-xl font-bold text-gray-900 mb-6">업체 등록</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 업체명 */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">업체명</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="업체명을 입력하세요"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 전화번호 */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">전화번호</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010-0000-0000"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 업체 유형 */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">업체 유형</label>
            <div className="grid grid-cols-2 gap-2">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setType(opt.value)}
                  className={`py-3 rounded-xl text-sm font-medium border transition-colors ${
                    type === opt.value
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-400 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading || !name.trim() || !phone.trim()}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium rounded-xl py-3 transition-colors"
          >
            {loading ? '등록 중...' : '업체 등록'}
          </button>
        </form>
      </main>
    </>
  );
}
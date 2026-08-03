'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import BackButton from '@/components/ui/BackButton';
import { getMerchantDailyStats } from '@/lib/api/merchants';
import { formatPrice } from '@/lib/utils/format';
import { shiftMonth } from '@/lib/utils/calendar';
import type { DailyMerchantStats } from '@/lib/types/merchant';

function SummaryCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-base font-bold ${accent ? 'text-blue-500' : 'text-gray-800'}`}>{value}</p>
    </div>
  );
}

function DayRow({ stat }: { stat: DailyMerchantStats }) {
  const [, , day] = stat.statDate.split('-');
  const date = new Date(stat.statDate);
  const dow = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="text-center w-10">
          <p className={`text-lg font-bold leading-none ${isWeekend ? 'text-blue-500' : 'text-gray-800'}`}>
            {Number(day)}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">{dow}요일</p>
        </div>
        <div className="flex gap-2">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-500">
            확정 {stat.confirmedCount}건
          </span>
          {stat.cancelledCount > 0 && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">
              취소 {stat.cancelledCount}건
            </span>
          )}
        </div>
      </div>
      <p className="text-sm font-bold text-gray-800">{formatPrice(stat.totalRevenue)}</p>
    </div>
  );
}

export default function MerchantStatsPage() {
  const { id } = useParams<{ id: string }>();
  const merchantId = Number(id);
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { data: stats = [], isLoading, isError } = useQuery({
    queryKey: ['merchant-daily-stats', merchantId, year, month],
    queryFn: () => getMerchantDailyStats(merchantId, year, month),
  });

  function prevMonth() {
    const shifted = shiftMonth(year, month, -1);
    setYear(shifted.year);
    setMonth(shifted.month);
  }

  function nextMonth() {
    const shifted = shiftMonth(year, month, 1);
    setYear(shifted.year);
    setMonth(shifted.month);
  }

  const totalRevenue = stats.reduce((sum, s) => sum + s.totalRevenue, 0);
  const totalConfirmed = stats.reduce((sum, s) => sum + s.confirmedCount, 0);
  const totalCancelled = stats.reduce((sum, s) => sum + s.cancelledCount, 0);

  return (
    <>
      <Header />

      <main className="max-w-screen-sm mx-auto px-4 py-6">
        <BackButton />

        <h1 className="text-xl font-bold text-gray-900 mb-5">일별 매출</h1>

        <div className="flex items-center justify-between mb-5">
          <button
            onClick={prevMonth}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            ‹
          </button>
          <span className="text-base font-semibold text-gray-800">{year}년 {month}월</span>
          <button
            onClick={nextMonth}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <SummaryCard label="월 매출" value={formatPrice(totalRevenue)} accent />
          <SummaryCard label="확정" value={`${totalConfirmed}건`} />
          <SummaryCard label="취소" value={`${totalCancelled}건`} />
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && isError && (
          <p className="text-sm text-red-400 text-center py-16">매출 데이터를 불러오지 못했습니다.</p>
        )}

        {!isLoading && !isError && stats.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-16">이 달의 매출 데이터가 없습니다.</p>
        )}

        {!isLoading && !isError && stats.length > 0 && (
          <div className="space-y-3">
            {stats.map((stat) => (
              <DayRow key={stat.statDate} stat={stat} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
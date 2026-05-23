'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { createReservation, getMerchant } from '@/lib/api/merchants';
import { getAvailableTimes } from '@/lib/api/resources';
import { getErrorMessage } from '@/lib/api/axios';
import type { AvailableTime, MerchantDetail, Resource } from '@/lib/types/merchant';

const TYPE_LABELS = {
  PENSION: '펜션',
  CLASS: '클래스',
  FACILITY: '시설',
} as const;

const TYPE_COLORS = {
  PENSION:  'bg-blue-50 text-blue-600',
  CLASS:    'bg-green-50 text-green-600',
  FACILITY: 'bg-purple-50 text-purple-600',
} as const;

function formatPrice(price: number) {
  return price.toLocaleString('ko-KR') + '원';
}

function formatTime(isoString: string) {
  const d = new Date(isoString);
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

// ─── 예약 가능 시간 모달 ─────────────────────────────────────────────
function AvailableTimesModal({
  resource,
  onClose,
}: {
  resource: Resource;
  onClose: () => void;
}) {
  const [date, setDate] = useState(today());
  const [times, setTimes] = useState<AvailableTime[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    setSelectedIds(new Set());
    getAvailableTimes(resource.id, date)
      .then(setTimes)
      .catch(() => setError('조회에 실패했습니다.'))
      .finally(() => setLoading(false));
  }, [resource.id, date]);

  const openTimes = times.filter((t) => t.status === 'OPEN');

  function toggleSlot(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleReserve() {
    if (selectedIds.size === 0) return;
    setBooking(true);
    setBookingError('');
    const payload = {
      resourceId: resource.id,
      availableTimeIds: Array.from(selectedIds),
      headCount: 1,
    };
    console.log('[예약 요청]', payload);
    try {
      await createReservation(payload);
      onClose();
    } catch (err) {
      console.error('[예약 오류]', err);
      setBookingError(getErrorMessage(err));
    } finally {
      setBooking(false);
    }
  }

  const totalPrice = resource.price * selectedIds.size;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* 오버레이 */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* 모달 본체 */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-6 max-h-[80vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{resource.name}</h2>
            <p className="text-sm text-blue-500 font-medium mt-0.5">{formatPrice(resource.price)}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        {/* 날짜 선택 */}
        <div className="mb-5">
          <label className="block text-xs font-medium text-gray-500 mb-1.5">날짜 선택</label>
          <input
            type="date"
            value={date}
            min={today()}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 가능 시간 목록 */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">예약 가능 시간</p>

          {loading && (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          )}

          {!loading && error && (
            <p className="text-sm text-red-400 text-center py-6">{error}</p>
          )}

          {!loading && !error && openTimes.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">선택한 날짜에 예약 가능한 시간이 없습니다.</p>
          )}

          {!loading && !error && openTimes.length > 0 && (
            <div className="space-y-2">
              {openTimes.map((t) => {
                const isSelected = selectedIds.has(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => toggleSlot(t.id)}
                    className={`w-full flex items-center justify-between rounded-xl px-4 py-3 transition-colors border ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                  >
                    <span className={`text-sm font-medium ${isSelected ? 'text-blue-600' : 'text-gray-800'}`}>
                      {formatTime(t.startTime)} ~ {formatTime(t.endTime)}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-lg transition-colors ${
                      isSelected ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-500'
                    }`}>
                      {isSelected ? '선택됨' : '선택'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 예약 버튼 영역 */}
        {!loading && !error && openTimes.length > 0 && (
          <div className="mt-5 pt-4 border-t border-gray-100">
            {bookingError && (
              <p className="text-sm text-red-400 text-center mb-3">{bookingError}</p>
            )}
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">
                {selectedIds.size > 0 ? `${selectedIds.size}개 선택` : '시간대를 선택하세요'}
              </span>
              {selectedIds.size > 0 && (
                <span className="text-sm font-bold text-blue-500">{formatPrice(totalPrice)}</span>
              )}
            </div>
            <button
              onClick={handleReserve}
              disabled={selectedIds.size === 0 || booking}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl py-3 transition-colors"
            >
              {booking ? '예약 중...' : '예약하기'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 리소스 카드 ──────────────────────────────────────────────────────
function ResourceCard({
  resource,
  onBook,
}: {
  resource: Resource;
  onBook: (r: Resource) => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 truncate">{resource.name}</h3>
          {resource.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">{resource.description}</p>
          )}
          <div className="flex items-center gap-3 mt-3 text-sm text-gray-500">
            <span>👥 최대 {resource.maxCapacity}인</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-base font-bold text-blue-500">{formatPrice(resource.price)}</p>
          <p className="text-xs text-gray-400 mt-0.5">1회</p>
        </div>
      </div>

      <button
        onClick={() => onBook(resource)}
        className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl py-2.5 transition-colors"
      >
        예약 가능 시간 보기
      </button>
    </div>
  );
}

// ─── 상세 페이지 ──────────────────────────────────────────────────────
export default function MerchantPublicDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [merchant, setMerchant] = useState<MerchantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  useEffect(() => {
    if (!id) return;
    getMerchant(Number(id))
      .then(setMerchant)
      .catch(() => setError('업체 정보를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <>
      <Header />

      <main className="max-w-screen-sm mx-auto px-4 py-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-5 transition-colors"
        >
          ← 목록으로
        </button>

        {loading && (
          <div className="space-y-4">
            <div className="h-8 w-48 bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-4 w-24 bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
            <div className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
          </div>
        )}

        {!loading && error && (
          <p className="text-sm text-red-400 text-center py-20">{error}</p>
        )}

        {!loading && !error && merchant && (
          <>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{merchant.name}</h1>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[merchant.type]}`}>
                  {TYPE_LABELS[merchant.type]}
                </span>
              </div>
              <p className="text-sm text-gray-400">
                {merchant.resources.length}개의 예약 가능 항목
              </p>
            </div>

            <div className="border-t border-gray-100 mb-6" />

            {merchant.resources.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-16">등록된 항목이 없습니다.</p>
            ) : (
              <div className="space-y-4">
                {merchant.resources.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onBook={setSelectedResource}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {selectedResource && (
        <AvailableTimesModal
          resource={selectedResource}
          onClose={() => setSelectedResource(null)}
        />
      )}
    </>
  );
}

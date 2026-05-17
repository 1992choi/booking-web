'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { getMyNotifications } from '@/lib/api/notifications';
import type { Notification } from '@/lib/types/notification';

function formatDate(isoString: string) {
  const d = new Date(isoString);
  return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
}

function NotificationItem({ notification }: { notification: Notification }) {
  return (
    <div className={`rounded-2xl px-5 py-4 border transition-colors ${
      notification.read
        ? 'bg-white border-gray-100 text-gray-400'
        : 'bg-blue-50 border-blue-100 text-gray-800'
    }`}>
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${notification.read ? 'bg-gray-200' : 'bg-blue-400'}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm leading-relaxed ${notification.read ? 'text-gray-400' : 'text-gray-800'}`}>
            {notification.message}
          </p>
          <p className="text-xs text-gray-300 mt-1.5">{formatDate(notification.createdAt)}</p>
        </div>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyNotifications()
      .then((data) => {
        console.log('[알림 응답]', data[0]);
        setNotifications(data);
      })
      .catch(() => setError('알림을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

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

        <h1 className="text-xl font-bold text-gray-900 mb-5">알림</h1>

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && error && (
          <p className="text-sm text-red-400 text-center py-16">{error}</p>
        )}

        {!loading && !error && notifications.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-16">알림이 없습니다.</p>
        )}

        {!loading && !error && notifications.length > 0 && (
          <div className="space-y-2">
            {notifications.map((n) => (
              <NotificationItem key={n.id} notification={n} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

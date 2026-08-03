'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import BackButton from '@/components/ui/BackButton';
import { getMyNotifications } from '@/lib/api/notifications';
import { formatDateTime } from '@/lib/utils/format';
import type { Notification } from '@/lib/types/notification';

const TYPE_LABELS: Record<string, string> = {
  RESERVATION_CONFIRMED: '예약 확정',
  RESERVATION_CANCELLED: '예약 취소',
  RESERVATION_REMINDER: '예약 알림',
  ADMIN_MESSAGE: '관리자 메시지',
};

function NotificationItem({ notification }: { notification: Notification }) {
  const label = TYPE_LABELS[notification.type] ?? notification.type;

  return (
    <div className="rounded-2xl px-5 py-4 border bg-white border-gray-100">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 w-2 h-2 rounded-full flex-shrink-0 bg-blue-400" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-800 leading-relaxed">
            <span className="font-medium">[{label}]</span>
            {notification.message && <span className="text-gray-600"> {notification.message}</span>}
          </p>
          <p className="text-xs text-gray-300 mt-1.5">{formatDateTime(notification.sentAt)}</p>
        </div>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyNotifications()
      .then(setNotifications)
      .catch(() => setError('알림을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Header />

      <main className="max-w-screen-sm mx-auto px-4 py-6">
        <BackButton />

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

'use client';

import { useOptimistic, useTransition } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/Header';
import BackButton from '@/components/ui/BackButton';
import { SkeletonList } from '@/components/ui/Skeleton';
import { EmptyText, ErrorText } from '@/components/ui/StatusMessage';
import { getMyNotifications, markNotificationRead } from '@/lib/api/notifications';
import { formatDateTime } from '@/lib/utils/format';
import { NOTIFICATION_TYPE_LABELS } from '@/lib/constants/notification';
import type { Notification } from '@/lib/types/notification';
import { useDocumentTitle } from '@/lib/hooks/useDocumentTitle';

function NotificationItem({
  notification,
  onRead,
}: {
  notification: Notification;
  onRead: (id: number) => void;
}) {
  const label = NOTIFICATION_TYPE_LABELS[notification.type] ?? notification.type;
  const isUnread = notification.readAt == null;

  return (
    <div
      onClick={() => isUnread && onRead(notification.id)}
      className={`rounded-2xl px-5 py-4 border transition-colors ${
        isUnread ? 'bg-white border-gray-100 cursor-pointer' : 'bg-gray-50 border-gray-100'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${isUnread ? 'bg-blue-400' : 'bg-gray-200'}`} />
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
  useDocumentTitle('알림');
  const queryClient = useQueryClient();
  const [, startTransition] = useTransition();

  const { data: notifications = [], isLoading, isError } = useQuery({
    queryKey: ['my-notifications'],
    queryFn: getMyNotifications,
  });

  const [optimisticNotifications, markReadOptimistic] = useOptimistic(
    notifications,
    (state, id: number) => state.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)),
  );

  const { mutateAsync: markRead } = useMutation({
    mutationFn: (id: number) => markNotificationRead(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData<Notification[]>(['my-notifications'], (prev) =>
        prev?.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
      );
    },
  });

  function handleRead(id: number) {
    // 트랜지션이 markRead를 기다리는 동안 낙관적 상태가 유지된다.
    // 실패하면 캐시가 그대로라 트랜지션이 끝난 뒤 안읽음 상태로 되돌아간다.
    startTransition(async () => {
      markReadOptimistic(id);
      try {
        await markRead(id);
      } catch {
        // 에러는 무시 — 위 주석대로 낙관적 상태가 자동으로 되돌아간다.
      }
    });
  }

  return (
    <>
      <Header />

      <main className="max-w-(--breakpoint-sm) mx-auto px-4 py-6">
        <BackButton />

        <h1 className="text-xl font-bold text-gray-900 mb-5">알림</h1>

        {isLoading && <SkeletonList count={3} itemClassName="h-20 rounded-2xl" />}

        {!isLoading && isError && (
          <ErrorText className="py-16">알림을 불러오지 못했습니다.</ErrorText>
        )}

        {!isLoading && !isError && optimisticNotifications.length === 0 && (
          <EmptyText className="py-16">알림이 없습니다.</EmptyText>
        )}

        {!isLoading && !isError && optimisticNotifications.length > 0 && (
          <div className="space-y-2">
            {optimisticNotifications.map((n) => (
              <NotificationItem key={n.id} notification={n} onRead={handleRead} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

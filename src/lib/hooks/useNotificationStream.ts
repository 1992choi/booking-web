'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store/auth';
import { useToastStore } from '@/lib/store/toast';
import { getNotificationStreamUrl } from '@/lib/api/notifications';
import { NOTIFICATION_TYPE_LABELS } from '@/lib/constants/notification';
import type { Notification } from '@/lib/types/notification';

/** 로그인 상태인 동안 SSE로 알림을 구독해 목록 캐시를 실시간 갱신하고 토스트로 알려준다. */
export function useNotificationStream() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();
  const showToast = useToastStore((s) => s.showToast);

  useEffect(() => {
    if (!accessToken) return;

    const source = new EventSource(getNotificationStreamUrl(accessToken));

    source.addEventListener('notification', (event) => {
      try {
        const notification: Notification = JSON.parse((event as MessageEvent<string>).data);

        queryClient.setQueryData<Notification[]>(['my-notifications'], (prev) =>
          prev ? [notification, ...prev] : [notification],
        );

        const label = NOTIFICATION_TYPE_LABELS[notification.type] ?? notification.type;
        showToast('success', [`[${label}]`, notification.message].filter(Boolean).join(' '));
      } catch (err) {
        console.error('[알림 스트림] 메시지 파싱 실패', err);
      }
    });

    return () => source.close();
  }, [accessToken, queryClient, showToast]);
}

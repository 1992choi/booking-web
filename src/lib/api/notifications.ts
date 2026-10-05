import apiClient from './axios';
import type { Notification } from '@/lib/types/notification';

/** GET /api/v1/notifications/me */
export async function getMyNotifications(): Promise<Notification[]> {
  const { data } = await apiClient.get<Notification[]>('/notifications/me');
  return data;
}

/** PATCH /api/v1/notifications/{notificationId}/read */
export async function markNotificationRead(notificationId: number): Promise<void> {
  await apiClient.patch(`/notifications/${notificationId}/read`);
}

/** POST /api/v1/admin/users/{userId}/message (ADMIN only) */
export async function sendNotificationToUser(userId: number, message: string): Promise<void> {
  await apiClient.post(`/admin/users/${userId}/message`, { message });
}

/**
 * GET /api/v1/notifications/stream?token= — SSE 실시간 알림 구독 URL
 * EventSource는 커스텀 헤더를 보낼 수 없어 JWT를 쿼리 파라미터로 전달한다.
 */
export function getNotificationStreamUrl(token: string): string {
  return `/api/v1/notifications/stream?token=${encodeURIComponent(token)}`;
}

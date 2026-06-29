import apiClient from './axios';
import type { Notification } from '@/lib/types/notification';

/** GET /api/v1/notifications/me */
export async function getMyNotifications(): Promise<Notification[]> {
  const { data } = await apiClient.get<Notification[]>('/notifications/me');
  return data;
}

/** POST /api/v1/admin/users/{userId}/message (ADMIN only) */
export async function sendNotificationToUser(userId: number, message: string): Promise<void> {
  await apiClient.post(`/admin/users/${userId}/message`, { message });
}

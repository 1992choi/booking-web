import apiClient from './axios';
import type { Notification } from '@/lib/types/notification';

/** GET /api/v1/notifications/me */
export async function getMyNotifications(): Promise<Notification[]> {
  const { data } = await apiClient.get<Notification[]>('/notifications/me');
  return data;
}

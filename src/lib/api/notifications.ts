import apiClient from './axios';
import type { Notification } from '@/lib/types/notification';

export async function getMyNotifications(): Promise<Notification[]> {
  const { data } = await apiClient.get<Notification[]>('/notifications/me');
  return data;
}
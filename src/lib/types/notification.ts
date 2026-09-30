export type NotificationType = 'CONFIRMED' | 'CANCELLED' | 'ADMIN_MESSAGE';
export type NotificationChannel = string;
export type NotificationStatus = string;

export interface Notification {
  id: number;
  reservationId: number | null;
  message: string | null;
  type: NotificationType;
  channel: NotificationChannel;
  status: NotificationStatus;
  sentAt: string;
}
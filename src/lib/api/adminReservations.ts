import apiClient from './axios';
import type { AdminCalendarData } from '@/lib/types/admin';

/** GET /api/v1/admin/reservations/calendar?year=&month= */
export async function getAdminCalendar(year: number, month: number): Promise<AdminCalendarData> {
  const { data } = await apiClient.get<AdminCalendarData>('/admin/reservations/calendar', {
    params: { year, month },
  });
  return data;
}

/** PUT /api/v1/admin/reservations/:id/confirm */
export async function confirmReservation(reservationId: number): Promise<void> {
  await apiClient.put(`/admin/reservations/${reservationId}/confirm`);
}

/** PUT /api/v1/admin/reservations/:id/cancel */
export async function cancelReservation(reservationId: number): Promise<void> {
  await apiClient.put(`/admin/reservations/${reservationId}/cancel`);
}

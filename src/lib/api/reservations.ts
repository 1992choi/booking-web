import apiClient from './axios';
import type { CreateReservationRequest, Reservation, ReservationStatus } from '@/lib/types/reservation';
import type { PageResponse } from '@/lib/types/common';

/** POST /api/v1/reservations */
export async function createReservation(params: CreateReservationRequest): Promise<void> {
  await apiClient.post('/reservations', params);
}

/** GET /api/v1/reservations/:id */
export async function getReservation(id: number): Promise<Reservation> {
  const { data } = await apiClient.get<Reservation>(`/reservations/${id}`);
  return data;
}

/** PUT /api/v1/reservations/:id/cancel */
export async function cancelReservation(id: number): Promise<void> {
  await apiClient.put(`/reservations/${id}/cancel`);
}

/** GET /api/v1/reservations/me */
export async function getMyReservations(
  status?: ReservationStatus,
  page = 0,
  size = 10,
): Promise<PageResponse<Reservation>> {
  const { data } = await apiClient.get<PageResponse<Reservation>>('/reservations/me', {
    params: { ...(status ? { status } : {}), page, size },
  });
  return data;
}

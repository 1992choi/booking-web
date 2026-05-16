import apiClient from './axios';
import type { Reservation, ReservationStatus } from '@/lib/types/reservation';
import type { PageResponse } from '@/lib/types/common';

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
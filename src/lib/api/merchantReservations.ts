import apiClient from './axios';
import type { MerchantReservation, ReservationStatus } from '@/lib/types/reservation';
import type { PageResponse } from '@/lib/types/common';

export async function getMerchantReservations(
  status?: ReservationStatus,
  page = 0,
  size = 100,
): Promise<PageResponse<MerchantReservation>> {
  const { data } = await apiClient.get<PageResponse<MerchantReservation>>('/merchant/reservations', {
    params: { ...(status ? { status } : {}), page, size },
  });
  return data;
}

export async function updateReservationStatus(
  reservationId: number,
  status: ReservationStatus,
): Promise<void> {
  await apiClient.put(`/merchant/reservations/${reservationId}/status`, { status });
}

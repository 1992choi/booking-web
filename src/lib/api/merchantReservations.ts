import apiClient from './axios';
import type { MerchantReservation, ReservationStatus } from '@/lib/types/reservation';
import type { PageResponse } from '@/lib/types/common';

export async function getMerchantReservations(
  merchantId: number,
  status?: ReservationStatus,
  page = 0,
  size = 100,
): Promise<PageResponse<MerchantReservation>> {
  const { data } = await apiClient.get<PageResponse<MerchantReservation>>(`/merchants/${merchantId}/reservations`, {
    params: { ...(status ? { status } : {}), page, size },
  });
  return data;
}

export async function confirmReservation(reservationId: number): Promise<void> {
  await apiClient.put(`/admin/reservations/${reservationId}/confirm`);
}

export async function cancelReservation(reservationId: number): Promise<void> {
  await apiClient.put(`/admin/reservations/${reservationId}/cancel`);
}

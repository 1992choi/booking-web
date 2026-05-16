import apiClient from './axios';
import type { AvailableTime, CreateReservationRequest, OwnerDetail, OwnerSummary } from '@/lib/types/owner';

/** GET /api/v1/owners */
export async function getOwners(): Promise<OwnerSummary[]> {
  const { data } = await apiClient.get<OwnerSummary[]>('/owners');
  return data;
}

/** GET /api/v1/owners/:id */
export async function getOwner(id: number): Promise<OwnerDetail> {
  const { data } = await apiClient.get<OwnerDetail>(`/owners/${id}`);
  return data;
}

/** GET /api/v1/resources/:resourceId/available-times?date=YYYY-MM-DD */
export async function getAvailableTimes(resourceId: number, date: string): Promise<AvailableTime[]> {
  const { data } = await apiClient.get<AvailableTime[]>(`/resources/${resourceId}/available-times`, {
    params: { date },
  });
  return data;
}

/** POST /api/v1/reservations */
export async function createReservation(params: CreateReservationRequest): Promise<void> {
  await apiClient.post('/reservations', params);
}

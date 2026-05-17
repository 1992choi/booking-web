import apiClient from './axios';
import type {
  AvailableTime,
  CreateReservationRequest,
  MerchantDetail,
  MerchantRequest,
  MerchantSummary,
} from '@/lib/types/merchant';

/** GET /api/v1/merchants — all merchants (ADMIN) */
export async function getMerchants(): Promise<MerchantSummary[]> {
  const { data } = await apiClient.get<MerchantSummary[]>('/merchants');
  return data;
}

/** GET /api/v1/merchants/me — current user's merchants (MERCHANT) */
export async function getMyMerchants(): Promise<MerchantSummary[]> {
  const { data } = await apiClient.get<MerchantSummary[]>('/merchants/me');
  return data;
}

/** POST /api/v1/merchants */
export async function createMerchant(params: MerchantRequest): Promise<MerchantDetail> {
  const { data } = await apiClient.post<MerchantDetail>('/merchants', params);
  return data;
}

/** GET /api/v1/merchants/:id */
export async function getMerchant(id: number): Promise<MerchantDetail> {
  const { data } = await apiClient.get<MerchantDetail>(`/merchants/${id}`);
  return data;
}

/** PUT /api/v1/merchants/:id */
export async function updateMerchant(id: number, params: MerchantRequest): Promise<MerchantDetail> {
  const { data } = await apiClient.put<MerchantDetail>(`/merchants/${id}`, params);
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

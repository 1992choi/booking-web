import apiClient from './axios';
import type {
  CreateReservationRequest,
  MerchantDetail,
  MerchantRequest,
  MerchantResponse,
  MerchantSummary,
} from '@/lib/types/merchant';

/** GET /api/v1/merchants — all merchants (ADMIN) */
export async function getMerchants(): Promise<MerchantSummary[]> {
  const { data } = await apiClient.get<MerchantSummary[]>('/merchants');
  return data;
}

/** GET /api/v1/merchants/me — current user's merchants (MERCHANT) */
export async function getMyMerchants(): Promise<MerchantResponse[]> {
  const { data } = await apiClient.get<MerchantResponse[]>('/merchants/me');
  return data;
}

/** POST /api/v1/merchants */
export async function createMerchant(params: MerchantRequest): Promise<MerchantResponse> {
  const { data } = await apiClient.post<MerchantResponse>('/merchants', params);
  return data;
}

/** GET /api/v1/merchants/:id */
export async function getMerchant(id: number): Promise<MerchantDetail> {
  const { data } = await apiClient.get<MerchantDetail>(`/merchants/${id}`);
  return data;
}

/** PUT /api/v1/merchants/:id */
export async function updateMerchant(id: number, params: MerchantRequest): Promise<MerchantResponse> {
  const { data } = await apiClient.put<MerchantResponse>(`/merchants/${id}`, params);
  return data;
}

/** POST /api/v1/reservations */
export async function createReservation(params: CreateReservationRequest): Promise<void> {
  await apiClient.post('/reservations', params);
}

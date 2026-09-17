import apiClient from './axios';
import type {
  DailyMerchantStats,
  MerchantDetail,
  MerchantRequest,
  MerchantResponse,
  MerchantSummary,
} from '@/lib/types/merchant';
import type { PageResponse } from '@/lib/types/common';

/** GET /api/v1/merchants — 전체 업체 목록 (페이징) */
export async function getMerchants(page = 0, size = 10): Promise<PageResponse<MerchantSummary>> {
  const { data } = await apiClient.get<PageResponse<MerchantSummary>>('/merchants', {
    params: { page, size },
  });
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

/** GET /api/v1/merchants/:id/stats/daily?year=&month= */
export async function getMerchantDailyStats(id: number, year: number, month: number): Promise<DailyMerchantStats[]> {
  const { data } = await apiClient.get<DailyMerchantStats[]>(`/merchants/${id}/stats/daily`, {
    params: { year, month },
  });
  return data;
}

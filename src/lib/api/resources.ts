import apiClient from './axios';
import type { Resource } from '@/lib/types/merchant';

export interface ResourceRequest {
  name: string;
  description: string;
  price: number;
  maxCapacity: number;
}

/** POST /api/v1/merchants/:merchantId/resources */
export async function createResource(merchantId: number, params: ResourceRequest): Promise<Resource> {
  const { data } = await apiClient.post<Resource>(`/merchants/${merchantId}/resources`, params);
  return data;
}

/** PUT /api/v1/resources/:resourceId */
export async function updateResource(resourceId: number, params: ResourceRequest): Promise<Resource> {
  const { data } = await apiClient.put<Resource>(`/resources/${resourceId}`, params);
  return data;
}

/** DELETE /api/v1/resources/:resourceId */
export async function deleteResource(resourceId: number): Promise<void> {
  await apiClient.delete(`/resources/${resourceId}`);
}

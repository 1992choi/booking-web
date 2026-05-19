import apiClient from './axios';
import type { Resource, AvailableTime } from '@/lib/types/merchant';

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

/** GET /api/v1/resources/:resourceId/available-times?date=YYYY-MM-DD */
export async function getAvailableTimes(resourceId: number, date: string): Promise<AvailableTime[]> {
  const { data } = await apiClient.get<AvailableTime[]>(`/resources/${resourceId}/available-times`, {
    params: { date },
  });
  return data;
}

/** POST /api/v1/resources/:resourceId/available-times */
export async function createAvailableTime(resourceId: number, startTime: string, endTime: string): Promise<AvailableTime> {
  const { data } = await apiClient.post<AvailableTime>(`/resources/${resourceId}/available-times`, { startTime, endTime });
  return data;
}

/** PUT /api/v1/available-times/:id */
export async function updateAvailableTime(id: number, startTime: string, endTime: string): Promise<AvailableTime> {
  const { data } = await apiClient.put<AvailableTime>(`/available-times/${id}`, { startTime, endTime });
  return data;
}

/** DELETE /api/v1/available-times/:id */
export async function deleteAvailableTime(id: number): Promise<void> {
  await apiClient.delete(`/available-times/${id}`);
}

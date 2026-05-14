import apiClient from './axios';
import type { OwnerSummary } from '@/lib/types/owner';

/** GET /api/v1/owners */
export async function getOwners(): Promise<OwnerSummary[]> {
  const { data } = await apiClient.get<OwnerSummary[]>('/owners');
  return data;
}

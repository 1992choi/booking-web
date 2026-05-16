import apiClient from './axios';
import type { Payment } from '@/lib/types/payment';

export async function getPayment(reservationId: number): Promise<Payment> {
  const { data } = await apiClient.get<Payment>(`/payments/${reservationId}`);
  return data;
}

export async function refund(reservationId: number): Promise<void> {
  await apiClient.post(`/payments/${reservationId}/refund`);
}
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface Payment {
  id: number;
  reservationId: number;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
}
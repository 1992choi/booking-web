export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface Reservation {
  id: number;
  resourceName: string;
  headCount: number;
  amount: number;
  status: ReservationStatus;
  startTime: string;
  endTime: string;
}

export interface MerchantReservation extends Reservation {
  userName: string;
}
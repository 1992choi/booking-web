import type { ReservationStatus } from '@/lib/types/reservation';

export interface AdminCalendarEntry {
  reservationId: number;
  resourceName: string;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
}

export type AdminCalendarData = Record<string, AdminCalendarEntry[]>;

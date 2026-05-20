export type AdminReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface AdminCalendarEntry {
  reservationId: number;
  resourceName: string;
  startTime: string;
  endTime: string;
  status: AdminReservationStatus;
}

export type AdminCalendarData = Record<string, AdminCalendarEntry[]>;

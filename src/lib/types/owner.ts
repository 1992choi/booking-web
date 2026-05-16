export type OwnerType = 'PENSION' | 'CLASS' | 'FACILITY' | 'CONSULTING';

export interface OwnerSummary {
  id: number;
  name: string;
  type: OwnerType;
}

export interface Resource {
  id: number;
  ownerId: number;
  name: string;
  description: string | null;
  price: number;
  maxCapacity: number;
}

export interface AvailableTime {
  id: number;
  startTime: string;
  endTime: string;
  status: 'OPEN' | 'BLOCKED';
}

export interface OwnerDetail {
  id: number;
  name: string;
  type: OwnerType;
  resources: Resource[];
}

export interface CreateReservationRequest {
  resourceId: number;
  availableTimeIds: number[];
  headCount: number;
}

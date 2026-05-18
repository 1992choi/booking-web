export type MerchantType = 'PENSION' | 'CLASS' | 'FACILITY';

export interface MerchantSummary {
  id: number;
  name: string;
  type: MerchantType;
}

export interface Resource {
  id: number;
  merchantId: number;
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

export interface MerchantDetail {
  id: number;
  name: string;
  type: MerchantType;
  resources: Resource[];
}

export interface MerchantRequest {
  name: string;
  phone: string;
  type: MerchantType;
}

export interface CreateReservationRequest {
  resourceId: number;
  availableTimeIds: number[];
  headCount: number;
}

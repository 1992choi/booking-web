export type OwnerType = 'PENSION' | 'CLASS' | 'FACILITY' | 'CONSULTING';

export interface OwnerSummary {
  id: number;
  name: string;
  type: OwnerType;
}

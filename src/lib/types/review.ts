export interface Review {
  id: number;
  reservationId: number;
  merchantId: number;
  userId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewCreateRequest {
  reservationId: number;
  content: string;
}

export interface ReviewUpdateRequest {
  content: string;
}
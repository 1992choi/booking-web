import apiClient from './axios';
import type { Review, ReviewCreateRequest, ReviewUpdateRequest } from '@/lib/types/review';

/** GET /api/v1/reviews?merchantId= */
export async function getReviewsByMerchant(merchantId: number): Promise<Review[]> {
  const { data } = await apiClient.get<Review[]>('/reviews', { params: { merchantId } });
  return data;
}

/** POST /api/v1/reviews */
export async function createReview(body: ReviewCreateRequest): Promise<Review> {
  const { data } = await apiClient.post<Review>('/reviews', body);
  return data;
}

/** PATCH /api/v1/reviews/{reviewId} */
export async function updateReview(reviewId: number, body: ReviewUpdateRequest): Promise<Review> {
  const { data } = await apiClient.patch<Review>(`/reviews/${reviewId}`, body);
  return data;
}

/** DELETE /api/v1/reviews/{reviewId} */
export async function deleteReview(reviewId: number): Promise<void> {
  await apiClient.delete(`/reviews/${reviewId}`);
}
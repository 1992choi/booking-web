import apiClient from './axios';
import type { LoginRequest, SignupRequest, TokenResponse, UserResponse } from '@/lib/types/auth';

/** POST /api/v1/auth/signup */
export async function signup(data: SignupRequest): Promise<void> {
  await apiClient.post('/auth/signup', data);
}

/**
 * POST /api/v1/auth/login → GET /api/v1/users/me
 * Returns token + user info together for convenient one-shot login.
 */
export async function login(
  data: LoginRequest
): Promise<{ token: TokenResponse; user: UserResponse }> {
  const { data: token } = await apiClient.post<TokenResponse>('/auth/login', data);

  // Attach token immediately so the next request is authenticated
  apiClient.defaults.headers.common.Authorization = `Bearer ${token.accessToken}`;

  const { data: user } = await apiClient.get<UserResponse>('/users/me');

  // Remove temporary default header — the Zustand store interceptor takes over from here
  delete apiClient.defaults.headers.common.Authorization;

  return { token, user };
}

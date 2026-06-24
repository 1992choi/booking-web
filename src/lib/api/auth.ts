import apiClient from './axios';
import type { LoginRequest, RefreshResponse, SignupRequest, TokenResponse, UserResponse, UserUpdateRequest, Role } from '@/lib/types/auth';
/** GET /api/v1/admin/users?role= (ADMIN only) */
export async function getUsers(params?: { role?: Role }): Promise<UserResponse[]> {
  const { data } = await apiClient.get<UserResponse[]>('/admin/users', { params });
  return data;
}

/** GET /api/v1/users/me */
export async function getMe(): Promise<UserResponse> {
  const { data } = await apiClient.get<UserResponse>('/users/me');
  return data;
}

/** PUT /api/v1/users/me */
export async function updateMe(body: UserUpdateRequest): Promise<UserResponse> {
  const { data } = await apiClient.put<UserResponse>('/users/me', body);
  return data;
}

/** DELETE /api/v1/users/me */
export async function deleteMe(): Promise<void> {
  await apiClient.delete('/users/me');
}

/** POST /api/v1/auth/refresh */
export async function refresh(refreshToken: string): Promise<RefreshResponse> {
  const { data } = await apiClient.post<RefreshResponse>('/auth/refresh', { refreshToken });
  return data;
}

/** POST /api/v1/auth/logout */
export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

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

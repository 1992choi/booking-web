export type Role = 'USER' | 'MERCHANT' | 'ADMIN';

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshResponse {
  accessToken: string;
  expiresIn: number;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: Role;
  createdAt: string; // ISO 8601 (LocalDateTime)
}

export interface SignupRequest {
  name: string;
  email: string;
  phone: string;
  password: string; // min 8 chars
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserUpdateRequest {
  name: string;
  phone: string;
}

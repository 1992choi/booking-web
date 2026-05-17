export type Role = 'USER' | 'MERCHANT' | 'ADMIN';

export interface TokenResponse {
  accessToken: string;
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

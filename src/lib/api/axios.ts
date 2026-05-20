import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '@/lib/types/common';

/** Korean error messages keyed by backend error code */
const ERROR_MESSAGES: Record<string, string> = {
  RSV_001: '이미 예약된 시간대입니다. 다른 시간을 선택해 주세요.',
  RSV_002: '동시 요청이 많습니다. 잠시 후 다시 시도해 주세요.',
  RSV_003: '최대 인원을 초과했습니다.',
  API_001: '이미 사용 중인 이메일입니다.',
  API_002: '이메일 또는 비밀번호가 올바르지 않습니다.',
  PAY_001: '결제가 실패했습니다. 다시 시도해 주세요.',
  PAY_002: '환불 가능한 상태가 아닙니다.',
  AUTH_001: '로그인이 필요합니다.',
  AUTH_002: '접근 권한이 없습니다.',
};

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined;
    if (data?.code && ERROR_MESSAGES[data.code]) {
      return ERROR_MESSAGES[data.code];
    }
    if (data?.detail) return data.detail;
  }
  return '알 수 없는 오류가 발생했습니다.';
}

const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
});

/** Attach access token from Zustand store if available */
apiClient.interceptors.request.use((config) => {
  // Import lazily to avoid circular deps and SSR issues
  if (typeof window !== 'undefined') {
    const { useAuthStore } = require('@/lib/store/auth');
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

type RetryableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

let isRefreshing = false;
let queue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

function flushQueue(err: unknown, token: string | null) {
  queue.forEach(({ resolve, reject }) => (err ? reject(err) : resolve(token!)));
  queue = [];
}

/** On 401: attempt token refresh once, then retry; fall back to login redirect */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status !== 401 || typeof window === 'undefined') {
      return Promise.reject(error);
    }

    const original = error.config as RetryableRequest;

    // Refresh endpoint itself returned 401 — token is invalid, force logout
    if (original?.url?.includes('/auth/refresh')) {
      const { useAuthStore } = require('@/lib/store/auth');
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Another refresh is already in flight — queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return apiClient(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    const { useAuthStore } = require('@/lib/store/auth');
    const { refreshToken, clearAuth, setAccessToken } = useAuthStore.getState();

    if (!refreshToken) {
      clearAuth();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    try {
      const { refresh } = require('@/lib/api/auth');
      const { accessToken } = await refresh(refreshToken);
      setAccessToken(accessToken);
      flushQueue(null, accessToken);
      original.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(original);
    } catch (refreshError) {
      flushQueue(refreshError, null);
      clearAuth();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;

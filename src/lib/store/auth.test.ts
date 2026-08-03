// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from './auth';
import type { UserResponse } from '@/lib/types/auth';
import { testUser as user } from '@/lib/test/fixtures';

function getCookie(): string {
  return document.cookie;
}

beforeEach(() => {
  localStorage.clear();
  document.cookie = 'access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  useAuthStore.setState({
    accessToken: null,
    refreshToken: null,
    user: null,
    role: null,
    isAuthenticated: false,
  });
});

describe('setAuth', () => {
  it('토큰/유저/role/인증 상태를 설정한다', () => {
    useAuthStore.getState().setAuth('access-1', 'refresh-1', user);

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('access-1');
    expect(state.refreshToken).toBe('refresh-1');
    expect(state.user).toEqual(user);
    expect(state.role).toBe('USER');
    expect(state.isAuthenticated).toBe(true);
  });

  it('쿠키에 access token을 저장한다', () => {
    useAuthStore.getState().setAuth('access-1', 'refresh-1', user);

    expect(getCookie()).toContain('access-token=access-1');
  });
});

describe('setAccessToken', () => {
  it('accessToken만 갱신하고 쿠키도 갱신한다', () => {
    useAuthStore.getState().setAuth('access-1', 'refresh-1', user);

    useAuthStore.getState().setAccessToken('access-2');

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('access-2');
    expect(state.refreshToken).toBe('refresh-1');
    expect(getCookie()).toContain('access-token=access-2');
  });
});

describe('updateUser', () => {
  it('user와 role만 갱신하고 토큰은 유지한다', () => {
    useAuthStore.getState().setAuth('access-1', 'refresh-1', user);
    const updated: UserResponse = { ...user, name: '김철수', role: 'MERCHANT' };

    useAuthStore.getState().updateUser(updated);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(updated);
    expect(state.role).toBe('MERCHANT');
    expect(state.accessToken).toBe('access-1');
  });
});

describe('clearAuth', () => {
  it('모든 인증 상태를 초기화한다', () => {
    useAuthStore.getState().setAuth('access-1', 'refresh-1', user);

    useAuthStore.getState().clearAuth();

    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.user).toBeNull();
    expect(state.role).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('쿠키를 삭제한다', () => {
    useAuthStore.getState().setAuth('access-1', 'refresh-1', user);

    useAuthStore.getState().clearAuth();

    expect(getCookie()).not.toContain('access-token=access-1');
  });
});

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Role, UserResponse } from '@/lib/types/auth';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserResponse | null;
  role: Role | null;
  isAuthenticated: boolean;

  setAuth: (accessToken: string, refreshToken: string, user: UserResponse) => void;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
}

const COOKIE_NAME = 'access-token';

function setCookie(value: string) {
  document.cookie = `${COOKIE_NAME}=${value}; path=/; SameSite=Lax`;
}

function deleteCookie() {
  document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      role: null,
      isAuthenticated: false,

      setAuth: (accessToken, refreshToken, user) => {
        setCookie(accessToken);
        set({ accessToken, refreshToken, user, role: user.role, isAuthenticated: true });
      },

      setAccessToken: (accessToken) => {
        setCookie(accessToken);
        set({ accessToken });
      },

      clearAuth: () => {
        deleteCookie();
        set({ accessToken: null, refreshToken: null, user: null, role: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      // only persist token + user; cookie is synced on hydration
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Re-sync cookie from localStorage on page load
        if (state?.accessToken) {
          setCookie(state.accessToken);
        }
      },
    }
  )
);

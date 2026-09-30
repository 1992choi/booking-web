// @vitest-environment jsdom
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useNotificationStream } from './useNotificationStream';
import { useAuthStore } from '@/lib/store/auth';
import { useToastStore } from '@/lib/store/toast';

class MockEventSource {
  static instances: MockEventSource[] = [];
  url: string;
  closed = false;
  private listeners: Record<string, ((event: MessageEvent) => void)[]> = {};

  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
  }

  addEventListener(type: string, listener: (event: MessageEvent) => void) {
    (this.listeners[type] ??= []).push(listener);
  }

  emit(type: string, data: unknown) {
    this.listeners[type]?.forEach((listener) =>
      listener(new MessageEvent(type, { data: JSON.stringify(data) })),
    );
  }

  close() {
    this.closed = true;
  }
}

function setup() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
}

beforeEach(() => {
  MockEventSource.instances = [];
  vi.stubGlobal('EventSource', MockEventSource);
  useAuthStore.setState({
    accessToken: null,
    refreshToken: null,
    user: null,
    role: null,
    isAuthenticated: false,
  });
  useToastStore.setState({ toasts: [] });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useNotificationStream', () => {
  it('accessToken이 없으면 연결하지 않는다', () => {
    const { wrapper } = setup();
    renderHook(() => useNotificationStream(), { wrapper });

    expect(MockEventSource.instances).toHaveLength(0);
  });

  it('accessToken이 있으면 토큰을 쿼리 파라미터로 담아 연결한다', () => {
    useAuthStore.setState({ accessToken: 'token-123' });
    const { wrapper } = setup();
    renderHook(() => useNotificationStream(), { wrapper });

    expect(MockEventSource.instances).toHaveLength(1);
    expect(MockEventSource.instances[0].url).toBe('/api/v1/notifications/stream?token=token-123');
  });

  it('알림 이벤트를 받으면 목록 캐시 맨 앞에 추가하고 토스트로 알린다', async () => {
    useAuthStore.setState({ accessToken: 'token-123' });
    const { queryClient, wrapper } = setup();
    const existing = {
      id: 1, reservationId: 1, message: '기존 알림',
      type: 'CONFIRMED', channel: 'LOG', status: 'SENT', sentAt: '2024-01-01T00:00:00',
    };
    queryClient.setQueryData(['my-notifications'], [existing]);

    renderHook(() => useNotificationStream(), { wrapper });

    const incoming = {
      id: 2, reservationId: 2, message: '예약이 취소되었습니다.',
      type: 'CANCELLED', channel: 'LOG', status: 'SENT', sentAt: '2024-01-02T00:00:00',
    };
    MockEventSource.instances[0].emit('notification', incoming);

    await waitFor(() => {
      expect(queryClient.getQueryData(['my-notifications'])).toEqual([incoming, existing]);
    });
    expect(useToastStore.getState().toasts[0].message).toBe('[예약 취소] 예약이 취소되었습니다.');
  });

  it('언마운트 시 연결을 닫는다', () => {
    useAuthStore.setState({ accessToken: 'token-123' });
    const { wrapper } = setup();
    const { unmount } = renderHook(() => useNotificationStream(), { wrapper });

    unmount();

    expect(MockEventSource.instances[0].closed).toBe(true);
  });
});

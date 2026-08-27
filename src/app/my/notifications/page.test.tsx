// @vitest-environment jsdom
import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import NotificationsPage from './page';
import { renderWithQuery } from '@/lib/test-utils/renderWithQuery';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const getMyNotifications = vi.fn();
vi.mock('@/lib/api/notifications', () => ({
  getMyNotifications: (...args: unknown[]) => getMyNotifications(...args),
}));

const notification = {
  id: 1,
  reservationId: 10,
  message: '예약이 확정되었습니다.',
  type: 'RESERVATION_CONFIRMED' as const,
  channel: 'EMAIL' as const,
  status: 'SENT' as const,
  sentAt: '2024-05-01T09:00:00',
};

beforeEach(() => {
  getMyNotifications.mockReset();
});

describe('NotificationsPage', () => {
  it('알림 목록을 불러와 보여준다', async () => {
    getMyNotifications.mockResolvedValue([notification]);
    renderWithQuery(<NotificationsPage />);

    expect(await screen.findByText('[예약 확정]')).toBeInTheDocument();
    expect(screen.getByText('예약이 확정되었습니다.')).toBeInTheDocument();
  });

  it('알림이 없으면 안내 문구를 보여준다', async () => {
    getMyNotifications.mockResolvedValue([]);
    renderWithQuery(<NotificationsPage />);

    expect(await screen.findByText('알림이 없습니다.')).toBeInTheDocument();
  });

  it('불러오기 실패 시 에러 메시지를 보여준다', async () => {
    getMyNotifications.mockRejectedValue(new Error('network error'));
    renderWithQuery(<NotificationsPage />);

    expect(await screen.findByText('알림을 불러오지 못했습니다.')).toBeInTheDocument();
  });
});

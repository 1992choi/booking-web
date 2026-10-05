// @vitest-environment jsdom
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import NotificationsPage from './page';
import { renderWithQuery } from '@/lib/test-utils/renderWithQuery';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const getMyNotifications = vi.fn();
const markNotificationRead = vi.fn();
vi.mock('@/lib/api/notifications', () => ({
  getMyNotifications: (...args: unknown[]) => getMyNotifications(...args),
  markNotificationRead: (...args: unknown[]) => markNotificationRead(...args),
}));

const notification = {
  id: 1,
  reservationId: 10,
  message: '예약이 확정되었습니다.',
  type: 'CONFIRMED' as const,
  channel: 'EMAIL' as const,
  status: 'SENT' as const,
  sentAt: '2024-05-01T09:00:00',
  readAt: null,
};

beforeEach(() => {
  getMyNotifications.mockReset();
  markNotificationRead.mockReset();
  markNotificationRead.mockResolvedValue(undefined);
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

  it('읽지 않은 알림을 클릭하면 읽음 처리를 요청한다', async () => {
    getMyNotifications.mockResolvedValue([notification]);
    renderWithQuery(<NotificationsPage />);

    await userEvent.click(await screen.findByText('[예약 확정]'));

    expect(markNotificationRead).toHaveBeenCalledWith(1);
  });

  it('읽음 처리가 끝나면 안읽음 표시가 사라진다', async () => {
    getMyNotifications.mockResolvedValue([notification]);
    const { container } = renderWithQuery(<NotificationsPage />);

    await screen.findByText('[예약 확정]');
    expect(container.querySelector('.bg-blue-400')).toBeInTheDocument();

    await userEvent.click(screen.getByText('[예약 확정]'));

    await vi.waitFor(() => expect(container.querySelector('.bg-blue-400')).not.toBeInTheDocument());
  });

  it('이미 읽은 알림은 클릭해도 읽음 처리를 다시 요청하지 않는다', async () => {
    getMyNotifications.mockResolvedValue([{ ...notification, readAt: '2024-05-01T10:00:00' }]);
    renderWithQuery(<NotificationsPage />);

    await userEvent.click(await screen.findByText('[예약 확정]'));

    expect(markNotificationRead).not.toHaveBeenCalled();
  });
});

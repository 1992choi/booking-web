// @vitest-environment jsdom
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SendMessagePage from './page';
import { renderWithQuery } from '@/lib/test-utils/renderWithQuery';

const back = vi.fn();
vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '1' }),
  useRouter: () => ({ back }),
}));

const getUsers = vi.fn();
vi.mock('@/lib/api/auth', () => ({
  getUsers: (...args: unknown[]) => getUsers(...args),
}));

const sendNotificationToUser = vi.fn();
vi.mock('@/lib/api/notifications', () => ({
  sendNotificationToUser: (...args: unknown[]) => sendNotificationToUser(...args),
}));

const users = [
  { id: 1, name: '홍길동', email: 'hong@example.com', phone: '010-1234-5678', role: 'USER' as const, createdAt: '2024-01-15T10:30:00' },
];

beforeEach(() => {
  back.mockClear();
  getUsers.mockReset();
  sendNotificationToUser.mockReset();
});

describe('SendMessagePage', () => {
  it('수신자 정보를 보여준다', async () => {
    getUsers.mockResolvedValue(users);
    renderWithQuery(<SendMessagePage />);

    expect(await screen.findByText('홍길동')).toBeInTheDocument();
    expect(screen.getByText('hong@example.com')).toBeInTheDocument();
  });

  it('회원을 찾을 수 없으면 안내 문구를 보여주고 폼을 숨긴다', async () => {
    getUsers.mockResolvedValue([]);
    renderWithQuery(<SendMessagePage />);

    expect(await screen.findByText('회원 정보를 찾을 수 없습니다.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '메시지 발송' })).not.toBeInTheDocument();
  });

  it('메시지를 발송하면 이전 화면으로 이동한다', async () => {
    getUsers.mockResolvedValue(users);
    sendNotificationToUser.mockResolvedValue(undefined);
    renderWithQuery(<SendMessagePage />);
    await screen.findByText('홍길동');

    await userEvent.type(screen.getByPlaceholderText('보낼 메시지를 입력하세요.'), '안녕하세요');
    await userEvent.click(screen.getByRole('button', { name: '메시지 발송' }));

    await vi.waitFor(() => expect(sendNotificationToUser).toHaveBeenCalledWith(1, '안녕하세요'));
    await vi.waitFor(() => expect(back).toHaveBeenCalled());
  });

  it('발송 실패 시 에러 메시지를 보여준다', async () => {
    getUsers.mockResolvedValue(users);
    sendNotificationToUser.mockRejectedValue(new Error('network error'));
    renderWithQuery(<SendMessagePage />);
    await screen.findByText('홍길동');

    await userEvent.type(screen.getByPlaceholderText('보낼 메시지를 입력하세요.'), '안녕하세요');
    await userEvent.click(screen.getByRole('button', { name: '메시지 발송' }));

    expect(await screen.findByText('알 수 없는 오류가 발생했습니다.')).toBeInTheDocument();
  });
});

// @vitest-environment jsdom
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminUsersPage from './page';
import { renderWithQuery } from '@/lib/test-utils/renderWithQuery';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const getUsers = vi.fn();
vi.mock('@/lib/api/auth', () => ({
  getUsers: (...args: unknown[]) => getUsers(...args),
}));

const users = [
  { id: 1, name: '홍길동', email: 'hong@example.com', phone: '010-1234-5678', role: 'USER' as const, createdAt: '2024-01-15T10:30:00' },
  { id: 2, name: '김사장', email: 'kim@example.com', phone: '010-2222-3333', role: 'MERCHANT' as const, createdAt: '2024-02-01T09:00:00' },
];

beforeEach(() => {
  getUsers.mockReset();
});

describe('AdminUsersPage', () => {
  it('회원 목록을 불러와 보여준다', async () => {
    getUsers.mockResolvedValue(users);
    renderWithQuery(<AdminUsersPage />);

    expect(await screen.findByText('홍길동')).toBeInTheDocument();
    expect(screen.getByText('김사장')).toBeInTheDocument();
    expect(screen.getByText('총 2명')).toBeInTheDocument();
  });

  it('탭을 변경하면 role 필터로 다시 조회한다', async () => {
    getUsers.mockResolvedValue(users);
    renderWithQuery(<AdminUsersPage />);
    await screen.findByText('홍길동');

    await userEvent.click(screen.getByRole('button', { name: '업체 운영자' }));

    await vi.waitFor(() => {
      expect(getUsers).toHaveBeenLastCalledWith({ role: 'MERCHANT' });
    });
  });

  it('불러오기 실패 시 에러 메시지를 보여준다', async () => {
    getUsers.mockRejectedValue(new Error('network error'));
    renderWithQuery(<AdminUsersPage />);

    expect(await screen.findByText('회원 목록을 불러오지 못했습니다.')).toBeInTheDocument();
  });

  it('결과가 없으면 안내 문구를 보여준다', async () => {
    getUsers.mockResolvedValue([]);
    renderWithQuery(<AdminUsersPage />);

    expect(await screen.findByText('해당하는 회원이 없습니다.')).toBeInTheDocument();
  });
});

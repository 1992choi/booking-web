// @vitest-environment jsdom
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MyPage from './page';
import { useAuthStore } from '@/lib/store/auth';
import { renderWithQuery } from '@/lib/test-utils/renderWithQuery';

const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

const getMe = vi.fn();
const updateMe = vi.fn();
const deleteMe = vi.fn();
const logout = vi.fn();
vi.mock('@/lib/api/auth', () => ({
  getMe: (...args: unknown[]) => getMe(...args),
  updateMe: (...args: unknown[]) => updateMe(...args),
  deleteMe: (...args: unknown[]) => deleteMe(...args),
  logout: (...args: unknown[]) => logout(...args),
}));

const user = {
  id: 1,
  name: '홍길동',
  email: 'hong@example.com',
  phone: '010-1234-5678',
  role: 'USER' as const,
  createdAt: '2024-01-15T10:30:00',
};

beforeEach(() => {
  push.mockClear();
  getMe.mockReset();
  updateMe.mockReset();
  deleteMe.mockReset();
  logout.mockReset();
  logout.mockResolvedValue(undefined);
});

describe('MyPage', () => {
  it('내 정보를 불러와 보여준다', async () => {
    getMe.mockResolvedValue(user);
    renderWithQuery(<MyPage />);

    expect(await screen.findByText('홍길동')).toBeInTheDocument();
    expect(screen.getByText('hong@example.com')).toBeInTheDocument();
  });

  it('불러오기 실패 시 에러 메시지를 보여준다', async () => {
    getMe.mockRejectedValue(new Error('network error'));
    renderWithQuery(<MyPage />);

    expect(await screen.findByText('정보를 불러오지 못했습니다.')).toBeInTheDocument();
  });

  it('정보 수정에 성공하면 새 값으로 보여준다', async () => {
    getMe.mockResolvedValue(user);
    updateMe.mockResolvedValue({ ...user, name: '김철수', phone: '010-9999-8888' });

    renderWithQuery(<MyPage />);
    await screen.findByText('홍길동');
    await userEvent.click(screen.getByText('수정'));

    const nameInput = screen.getByDisplayValue('홍길동');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, '김철수');
    await userEvent.click(screen.getByRole('button', { name: '저장' }));

    await vi.waitFor(() => expect(updateMe).toHaveBeenCalledWith({ name: '김철수', phone: '010-1234-5678' }));
    expect(await screen.findByText('김철수')).toBeInTheDocument();
  });

  it('로그아웃 시 인증 상태를 정리하고 로그인 페이지로 이동한다', async () => {
    getMe.mockResolvedValue(user);
    renderWithQuery(<MyPage />);
    await screen.findByText('홍길동');

    await userEvent.click(screen.getByText('로그아웃'));

    await vi.waitFor(() => expect(logout).toHaveBeenCalled());
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(push).toHaveBeenCalledWith('/login');
  });

  it('회원 탈퇴 확인 후 탈퇴하면 로그인 페이지로 이동한다', async () => {
    getMe.mockResolvedValue(user);
    deleteMe.mockResolvedValue(undefined);

    renderWithQuery(<MyPage />);
    await screen.findByText('홍길동');
    await userEvent.click(screen.getByText('회원 탈퇴'));
    await userEvent.click(screen.getByRole('button', { name: '탈퇴하기' }));

    await vi.waitFor(() => expect(deleteMe).toHaveBeenCalled());
    expect(push).toHaveBeenCalledWith('/login');
  });
});

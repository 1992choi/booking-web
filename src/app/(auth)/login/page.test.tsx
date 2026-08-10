// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LoginPage from './page';
import { useAuthStore } from '@/lib/store/auth';

const push = vi.fn();
const replace = vi.fn();
let searchParams = new URLSearchParams();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace }),
  useSearchParams: () => searchParams,
}));

const login = vi.fn();
vi.mock('@/lib/api/auth', () => ({
  login: (...args: unknown[]) => login(...args),
}));

beforeEach(() => {
  push.mockClear();
  replace.mockClear();
  login.mockClear();
  searchParams = new URLSearchParams();
  useAuthStore.setState({
    accessToken: null,
    refreshToken: null,
    user: null,
    role: null,
    isAuthenticated: false,
  });
});

describe('LoginPage', () => {
  it('이메일/비밀번호 입력 필드와 로그인 버튼을 보여준다', () => {
    render(<LoginPage />);

    expect(screen.getByText('이메일')).toBeInTheDocument();
    expect(screen.getByText('비밀번호')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
  });

  it('registered 쿼리 파라미터가 있으면 가입 완료 안내를 보여준다', () => {
    searchParams = new URLSearchParams('registered=1');
    render(<LoginPage />);

    expect(screen.getByText('회원가입이 완료됐습니다. 로그인해 주세요.')).toBeInTheDocument();
  });

  it('빈 값으로 제출하면 유효성 에러를 보여준다', async () => {
    render(<LoginPage />);
    await userEvent.click(screen.getByRole('button', { name: '로그인' }));

    expect(await screen.findByText('올바른 이메일 형식이 아닙니다.')).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it('로그인 성공 시 인증 상태를 저장하고 이동한다', async () => {
    login.mockResolvedValue({
      token: { accessToken: 'access-1', refreshToken: 'refresh-1' },
      user: { id: 1, name: '홍길동', email: 'hong@example.com', phone: '010-1234-5678', role: 'USER', createdAt: '2024-01-15T10:30:00' },
    });

    render(<LoginPage />);
    await userEvent.type(screen.getByPlaceholderText('example@email.com'), 'hong@example.com');
    await userEvent.type(screen.getByPlaceholderText('비밀번호를 입력해 주세요.'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: '로그인' }));

    await waitFor(() => expect(login).toHaveBeenCalledWith({ email: 'hong@example.com', password: 'password123' }));
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(replace).toHaveBeenCalledWith('/');
  });

  it('로그인 실패 시 에러 메시지를 보여준다', async () => {
    login.mockRejectedValue(new Error('network error'));

    render(<LoginPage />);
    await userEvent.type(screen.getByPlaceholderText('example@email.com'), 'hong@example.com');
    await userEvent.type(screen.getByPlaceholderText('비밀번호를 입력해 주세요.'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: '로그인' }));

    expect(await screen.findByText('알 수 없는 오류가 발생했습니다.')).toBeInTheDocument();
  });
});

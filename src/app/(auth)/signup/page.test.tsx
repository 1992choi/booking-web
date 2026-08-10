// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SignupPage from './page';

const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

const signup = vi.fn();
vi.mock('@/lib/api/auth', () => ({
  signup: (...args: unknown[]) => signup(...args),
}));

beforeEach(() => {
  push.mockClear();
  signup.mockClear();
});

async function fillValidForm() {
  await userEvent.type(screen.getByPlaceholderText('홍길동'), '홍길동');
  await userEvent.type(screen.getByPlaceholderText('example@email.com'), 'hong@example.com');
  await userEvent.type(screen.getByPlaceholderText('010-1234-5678'), '010-1234-5678');
  await userEvent.type(screen.getByPlaceholderText('8자 이상 입력해 주세요.'), 'password123');
  await userEvent.type(screen.getByPlaceholderText('비밀번호를 한 번 더 입력해 주세요.'), 'password123');
}

describe('SignupPage', () => {
  it('회원가입 입력 필드를 모두 보여준다', () => {
    render(<SignupPage />);

    expect(screen.getByText('이름')).toBeInTheDocument();
    expect(screen.getByText('이메일')).toBeInTheDocument();
    expect(screen.getByText('전화번호')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '가입하기' })).toBeInTheDocument();
  });

  it('빈 값으로 제출하면 유효성 에러를 보여준다', async () => {
    render(<SignupPage />);
    await userEvent.click(screen.getByRole('button', { name: '가입하기' }));

    expect(await screen.findByText('이름을 입력해 주세요.')).toBeInTheDocument();
    expect(signup).not.toHaveBeenCalled();
  });

  it('비밀번호 확인이 다르면 에러를 보여준다', async () => {
    render(<SignupPage />);
    await fillValidForm();
    await userEvent.clear(screen.getByPlaceholderText('비밀번호를 한 번 더 입력해 주세요.'));
    await userEvent.type(screen.getByPlaceholderText('비밀번호를 한 번 더 입력해 주세요.'), 'different123');
    await userEvent.click(screen.getByRole('button', { name: '가입하기' }));

    expect(await screen.findByText('비밀번호가 일치하지 않습니다.')).toBeInTheDocument();
    expect(signup).not.toHaveBeenCalled();
  });

  it('가입 성공 시 로그인 페이지로 이동한다', async () => {
    signup.mockResolvedValue(undefined);

    render(<SignupPage />);
    await fillValidForm();
    await userEvent.click(screen.getByRole('button', { name: '가입하기' }));

    await waitFor(() => expect(signup).toHaveBeenCalledWith({
      name: '홍길동',
      email: 'hong@example.com',
      phone: '010-1234-5678',
      password: 'password123',
    }));
    expect(push).toHaveBeenCalledWith('/login?registered=1');
  });

  it('가입 실패 시 에러 메시지를 보여준다', async () => {
    signup.mockRejectedValue(new Error('conflict'));

    render(<SignupPage />);
    await fillValidForm();
    await userEvent.click(screen.getByRole('button', { name: '가입하기' }));

    expect(await screen.findByText('알 수 없는 오류가 발생했습니다.')).toBeInTheDocument();
  });
});

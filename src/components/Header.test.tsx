// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Header from './Header';
import { useAuthStore } from '@/lib/store/auth';
import type { UserResponse } from '@/lib/types/auth';

const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

const logout = vi.fn();
vi.mock('@/lib/api/auth', () => ({
  logout: (...args: unknown[]) => logout(...args),
}));

const user: UserResponse = {
  id: 1,
  name: '홍길동',
  email: 'hong@example.com',
  phone: '010-1234-5678',
  role: 'USER',
  createdAt: '2024-01-15T10:30:00',
};

function loginAs(role: UserResponse['role']) {
  useAuthStore.setState({
    accessToken: 'access-1',
    refreshToken: 'refresh-1',
    user: { ...user, role },
    role,
    isAuthenticated: true,
  });
}

beforeEach(() => {
  push.mockClear();
  logout.mockClear();
  logout.mockResolvedValue(undefined);
  useAuthStore.setState({
    accessToken: null,
    refreshToken: null,
    user: null,
    role: null,
    isAuthenticated: false,
  });
});

describe('Header - 비로그인 상태', () => {
  it('로그인/회원가입 링크를 보여주고 사용자 메뉴는 없다', () => {
    render(<Header />);

    expect(screen.getByText('로그인')).toBeInTheDocument();
    expect(screen.getByText('회원가입')).toBeInTheDocument();
    expect(screen.queryByLabelText('사용자 메뉴')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('알림')).not.toBeInTheDocument();
  });
});

describe('Header - USER role', () => {
  beforeEach(() => loginAs('USER'));

  it('내 예약 링크를 보여주고 업체/회원 관리 링크는 없다', () => {
    render(<Header />);

    expect(screen.getByLabelText('사용자 메뉴')).toBeInTheDocument();
    expect(screen.getByLabelText('알림')).toBeInTheDocument();
    expect(screen.queryByText('로그인')).not.toBeInTheDocument();
  });

  it('드롭다운을 열면 내 예약 링크가 보이고 업체/회원 관리는 없다', async () => {
    render(<Header />);
    await userEvent.click(screen.getByLabelText('사용자 메뉴'));

    expect(screen.getByText('내 예약')).toBeInTheDocument();
    expect(screen.queryByText('업체 관리')).not.toBeInTheDocument();
    expect(screen.queryByText('회원 관리')).not.toBeInTheDocument();
  });
});

describe('Header - MERCHANT role', () => {
  beforeEach(() => loginAs('MERCHANT'));

  it('드롭다운을 열면 업체 관리 링크가 보이고 내 예약/회원 관리는 없다', async () => {
    render(<Header />);
    await userEvent.click(screen.getByLabelText('사용자 메뉴'));

    expect(screen.getByText('업체 관리')).toBeInTheDocument();
    expect(screen.queryByText('내 예약')).not.toBeInTheDocument();
    expect(screen.queryByText('회원 관리')).not.toBeInTheDocument();
  });
});

describe('Header - ADMIN role', () => {
  beforeEach(() => loginAs('ADMIN'));

  it('드롭다운을 열면 업체 관리와 회원 관리 링크를 모두 보여준다', async () => {
    render(<Header />);
    await userEvent.click(screen.getByLabelText('사용자 메뉴'));

    expect(screen.getByText('업체 관리')).toBeInTheDocument();
    expect(screen.getByText('회원 관리')).toBeInTheDocument();
  });
});

describe('Header - 드롭다운 상호작용', () => {
  beforeEach(() => loginAs('USER'));

  it('버튼을 다시 클릭하면 닫힌다', async () => {
    render(<Header />);
    const trigger = screen.getByLabelText('사용자 메뉴');

    await userEvent.click(trigger);
    expect(screen.getByText('내 예약')).toBeInTheDocument();

    await userEvent.click(trigger);
    expect(screen.queryByText('내 예약')).not.toBeInTheDocument();
  });

  it('바깥 영역을 클릭하면 닫힌다', async () => {
    render(
      <div>
        <Header />
        <button>바깥</button>
      </div>
    );

    await userEvent.click(screen.getByLabelText('사용자 메뉴'));
    expect(screen.getByText('내 예약')).toBeInTheDocument();

    await userEvent.click(screen.getByText('바깥'));
    expect(screen.queryByText('내 예약')).not.toBeInTheDocument();
  });
});

describe('Header - 로그아웃', () => {
  beforeEach(() => loginAs('USER'));

  it('로그아웃 클릭 시 API 호출, 인증 초기화, 로그인 페이지 이동을 수행한다', async () => {
    render(<Header />);
    await userEvent.click(screen.getByLabelText('사용자 메뉴'));
    await userEvent.click(screen.getByText('로그아웃'));

    expect(logout).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(push).toHaveBeenCalledWith('/login');
  });

  it('로그아웃 API가 실패해도 클라이언트 상태는 정리된다', async () => {
    logout.mockRejectedValue(new Error('network error'));
    render(<Header />);
    await userEvent.click(screen.getByLabelText('사용자 메뉴'));
    await userEvent.click(screen.getByText('로그아웃'));

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(push).toHaveBeenCalledWith('/login');
  });
});

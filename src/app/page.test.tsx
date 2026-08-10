// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import HomePage from './page';
import { useAuthStore } from '@/lib/store/auth';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const getMerchants = vi.fn();
vi.mock('@/lib/api/merchants', () => ({
  getMerchants: (...args: unknown[]) => getMerchants(...args),
}));

const merchants = [
  { id: 1, name: '한적한 펜션', type: 'PENSION' as const },
  { id: 2, name: '요가 클래스', type: 'CLASS' as const },
];

beforeEach(() => {
  getMerchants.mockReset();
  useAuthStore.setState({
    accessToken: null,
    refreshToken: null,
    user: null,
    role: null,
    isAuthenticated: false,
  });
});

describe('HomePage', () => {
  it('업체 목록을 불러와 보여준다', async () => {
    getMerchants.mockResolvedValue(merchants);
    render(<HomePage />);

    expect(await screen.findByText('한적한 펜션')).toBeInTheDocument();
    expect(screen.getByText('요가 클래스')).toBeInTheDocument();
  });

  it('카테고리 탭으로 필터링한다', async () => {
    getMerchants.mockResolvedValue(merchants);
    render(<HomePage />);
    await screen.findByText('한적한 펜션');

    await userEvent.click(screen.getAllByText('펜션')[0]);

    expect(screen.getByText('한적한 펜션')).toBeInTheDocument();
    expect(screen.queryByText('요가 클래스')).not.toBeInTheDocument();
  });

  it('불러오기 실패 시 에러 메시지를 보여준다', async () => {
    getMerchants.mockRejectedValue(new Error('network error'));
    render(<HomePage />);

    expect(await screen.findByText('업체 목록을 불러오지 못했습니다.')).toBeInTheDocument();
  });

  it('목록이 비어 있으면 안내 문구를 보여준다', async () => {
    getMerchants.mockResolvedValue([]);
    render(<HomePage />);

    expect(await screen.findByText('해당 유형의 업체가 없습니다.')).toBeInTheDocument();
  });
});

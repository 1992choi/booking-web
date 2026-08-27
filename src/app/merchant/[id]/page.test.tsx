// @vitest-environment jsdom
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MerchantDetailPage from './page';
import { useAuthStore } from '@/lib/store/auth';
import { renderWithQuery } from '@/lib/test-utils/renderWithQuery';

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '1' }),
  useRouter: () => ({ push: vi.fn() }),
}));

const getMerchant = vi.fn();
vi.mock('@/lib/api/merchants', () => ({
  getMerchant: (...args: unknown[]) => getMerchant(...args),
}));

const createResource = vi.fn();
const updateResource = vi.fn();
const deleteResource = vi.fn();
const getAvailableTimes = vi.fn();
const createAvailableTime = vi.fn();
const updateAvailableTime = vi.fn();
const deleteAvailableTime = vi.fn();
vi.mock('@/lib/api/resources', () => ({
  createResource: (...args: unknown[]) => createResource(...args),
  updateResource: (...args: unknown[]) => updateResource(...args),
  deleteResource: (...args: unknown[]) => deleteResource(...args),
  getAvailableTimes: (...args: unknown[]) => getAvailableTimes(...args),
  createAvailableTime: (...args: unknown[]) => createAvailableTime(...args),
  updateAvailableTime: (...args: unknown[]) => updateAvailableTime(...args),
  deleteAvailableTime: (...args: unknown[]) => deleteAvailableTime(...args),
}));

const merchant = {
  id: 1,
  name: '한적한 펜션',
  phone: '010-1234-5678',
  type: 'PENSION' as const,
  resources: [
    { id: 10, merchantId: 1, name: 'A동', description: null, price: 100000, maxCapacity: 4 },
  ],
};

function setRole(role: 'MERCHANT' | 'USER') {
  useAuthStore.setState({
    accessToken: 'access-1',
    refreshToken: 'refresh-1',
    user: { id: 1, name: '김사장', email: 'kim@example.com', phone: '010-1234-5678', role, createdAt: '2024-01-01T00:00:00' },
    role,
    isAuthenticated: true,
  });
}

beforeEach(() => {
  getMerchant.mockReset();
  createResource.mockReset();
});

describe('MerchantDetailPage', () => {
  it('업체 정보와 예약 대상 목록을 보여준다', async () => {
    setRole('USER');
    getMerchant.mockResolvedValue(merchant);

    renderWithQuery(<MerchantDetailPage />);

    expect(await screen.findByText('한적한 펜션')).toBeInTheDocument();
    expect(screen.getByText('A동')).toBeInTheDocument();
    expect(screen.queryByText('수정')).not.toBeInTheDocument();
    expect(screen.queryByText('+ 추가')).not.toBeInTheDocument();
  });

  it('MERCHANT는 수정/추가 컨트롤을 볼 수 있다', async () => {
    setRole('MERCHANT');
    getMerchant.mockResolvedValue(merchant);

    renderWithQuery(<MerchantDetailPage />);

    expect(await screen.findByText('수정')).toBeInTheDocument();
    expect(screen.getByText('+ 추가')).toBeInTheDocument();
  });

  it('예약 대상이 없으면 안내 문구를 보여준다', async () => {
    setRole('USER');
    getMerchant.mockResolvedValue({ ...merchant, resources: [] });

    renderWithQuery(<MerchantDetailPage />);

    expect(await screen.findByText('등록된 예약 대상이 없습니다.')).toBeInTheDocument();
  });

  it('불러오기 실패 시 에러 메시지를 보여준다', async () => {
    setRole('USER');
    getMerchant.mockRejectedValue(new Error('network error'));

    renderWithQuery(<MerchantDetailPage />);

    expect(await screen.findByText('업체 정보를 불러오지 못했습니다.')).toBeInTheDocument();
  });

  it('예약 대상을 추가하면 목록에 반영된다', async () => {
    setRole('MERCHANT');
    getMerchant.mockResolvedValue(merchant);
    createResource.mockResolvedValue({ id: 20, merchantId: 1, name: 'B동', description: '', price: 50000, maxCapacity: 2 });

    renderWithQuery(<MerchantDetailPage />);
    await screen.findByText('+ 추가');

    await userEvent.click(screen.getByText('+ 추가'));
    await userEvent.type(screen.getByPlaceholderText('예: A동, 오전반, 1번 코트'), 'B동');
    await userEvent.type(screen.getByPlaceholderText('0'), '50000');
    await userEvent.clear(screen.getByPlaceholderText('1'));
    await userEvent.type(screen.getByPlaceholderText('1'), '2');
    await userEvent.click(screen.getByRole('button', { name: '추가' }));

    await vi.waitFor(() => expect(createResource).toHaveBeenCalledWith(1, { name: 'B동', description: '', price: 50000, maxCapacity: 2 }));
    expect(await screen.findByText('B동')).toBeInTheDocument();
  });
});

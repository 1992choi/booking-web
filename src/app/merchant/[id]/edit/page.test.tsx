// @vitest-environment jsdom
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MerchantEditPage from './page';
import { renderWithQuery } from '@/lib/test-utils/renderWithQuery';

const push = vi.fn();
vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '1' }),
  useRouter: () => ({ push }),
}));

const getMerchant = vi.fn();
const updateMerchant = vi.fn();
vi.mock('@/lib/api/merchants', () => ({
  getMerchant: (...args: unknown[]) => getMerchant(...args),
  updateMerchant: (...args: unknown[]) => updateMerchant(...args),
}));

const merchant = { id: 1, name: '한적한 펜션', phone: '010-1234-5678', type: 'PENSION' as const, resources: [] };

beforeEach(() => {
  push.mockClear();
  getMerchant.mockReset();
  updateMerchant.mockReset();
});

describe('MerchantEditPage', () => {
  it('기존 업체 정보를 폼에 채워 보여준다', async () => {
    getMerchant.mockResolvedValue(merchant);
    renderWithQuery(<MerchantEditPage />);

    expect(await screen.findByDisplayValue('한적한 펜션')).toBeInTheDocument();
    expect(screen.getByDisplayValue('010-1234-5678')).toBeInTheDocument();
  });

  it('불러오기 실패 시 에러 메시지를 보여주고 폼을 숨긴다', async () => {
    getMerchant.mockRejectedValue(new Error('network error'));
    renderWithQuery(<MerchantEditPage />);

    expect(await screen.findByText('업체 정보를 불러오지 못했습니다.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '수정 완료' })).not.toBeInTheDocument();
  });

  it('수정 성공 시 상세 페이지로 이동한다', async () => {
    getMerchant.mockResolvedValue(merchant);
    updateMerchant.mockResolvedValue({ ...merchant, name: '조용한 펜션' });

    renderWithQuery(<MerchantEditPage />);
    const nameInput = await screen.findByDisplayValue('한적한 펜션');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, '조용한 펜션');
    await userEvent.click(screen.getByRole('button', { name: '수정 완료' }));

    await vi.waitFor(() =>
      expect(updateMerchant).toHaveBeenCalledWith(1, { name: '조용한 펜션', phone: '010-1234-5678', type: 'PENSION' })
    );
    expect(push).toHaveBeenCalledWith('/merchant/1');
  });

  it('수정 실패 시 에러 메시지를 보여준다', async () => {
    getMerchant.mockResolvedValue(merchant);
    updateMerchant.mockRejectedValue(new Error('network error'));

    renderWithQuery(<MerchantEditPage />);
    await screen.findByDisplayValue('한적한 펜션');
    await userEvent.click(screen.getByRole('button', { name: '수정 완료' }));

    expect(await screen.findByText('알 수 없는 오류가 발생했습니다.')).toBeInTheDocument();
  });
});

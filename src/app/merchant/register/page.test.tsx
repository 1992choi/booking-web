// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MerchantRegisterPage from './page';

const push = vi.fn();
const back = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, back }),
}));

const createMerchant = vi.fn();
vi.mock('@/lib/api/merchants', () => ({
  createMerchant: (...args: unknown[]) => createMerchant(...args),
}));

beforeEach(() => {
  push.mockClear();
  createMerchant.mockReset();
});

describe('MerchantRegisterPage', () => {
  it('업체 등록 입력 필드를 보여준다', () => {
    render(<MerchantRegisterPage />);

    expect(screen.getByPlaceholderText('업체명을 입력하세요')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('010-0000-0000')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '펜션' })).toBeInTheDocument();
  });

  it('빈 값으로 제출하면 유효성 에러를 보여준다', async () => {
    render(<MerchantRegisterPage />);
    await userEvent.click(screen.getByRole('button', { name: '업체 등록' }));

    expect(await screen.findByText('업체명을 입력해 주세요.')).toBeInTheDocument();
    expect(createMerchant).not.toHaveBeenCalled();
  });

  it('등록 성공 시 대시보드로 이동한다', async () => {
    createMerchant.mockResolvedValue({ id: 1, name: '한적한 펜션', phone: '010-1234-5678', type: 'PENSION' });

    render(<MerchantRegisterPage />);
    await userEvent.type(screen.getByPlaceholderText('업체명을 입력하세요'), '한적한 펜션');
    await userEvent.type(screen.getByPlaceholderText('010-0000-0000'), '010-1234-5678');
    await userEvent.click(screen.getByRole('button', { name: '클래스' }));
    await userEvent.click(screen.getByRole('button', { name: '업체 등록' }));

    await vi.waitFor(() =>
      expect(createMerchant).toHaveBeenCalledWith({ name: '한적한 펜션', phone: '010-1234-5678', type: 'CLASS' })
    );
    expect(push).toHaveBeenCalledWith('/merchant/dashboard');
  });

  it('등록 실패 시 에러 메시지를 보여준다', async () => {
    createMerchant.mockRejectedValue(new Error('network error'));

    render(<MerchantRegisterPage />);
    await userEvent.type(screen.getByPlaceholderText('업체명을 입력하세요'), '한적한 펜션');
    await userEvent.type(screen.getByPlaceholderText('010-0000-0000'), '010-1234-5678');
    await userEvent.click(screen.getByRole('button', { name: '업체 등록' }));

    expect(await screen.findByText('알 수 없는 오류가 발생했습니다.')).toBeInTheDocument();
  });
});

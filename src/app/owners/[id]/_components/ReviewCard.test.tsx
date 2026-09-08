// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReviewCard } from './ReviewCard';

const updateReview = vi.fn();
const deleteReview = vi.fn();
vi.mock('@/lib/api/reviews', () => ({
  updateReview: (...args: unknown[]) => updateReview(...args),
  deleteReview: (...args: unknown[]) => deleteReview(...args),
}));

const review = {
  id: 1,
  reservationId: 5,
  merchantId: 1,
  userId: 99,
  content: '좋았어요',
  createdAt: '2024-05-01T09:00:00',
  updatedAt: '2024-05-01T09:00:00',
};

beforeEach(() => {
  updateReview.mockReset();
  deleteReview.mockReset();
});

describe('ReviewCard', () => {
  it('본인 리뷰가 아니면 수정/삭제 버튼을 보여주지 않는다', () => {
    render(<ReviewCard review={review} isMine={false} onUpdated={vi.fn()} onDeleted={vi.fn()} />);

    expect(screen.queryByText('수정')).not.toBeInTheDocument();
    expect(screen.queryByText('삭제')).not.toBeInTheDocument();
  });

  it('수정 후 저장하면 updateReview를 호출하고 onUpdated를 실행한다', async () => {
    const onUpdated = vi.fn();
    const updated = { ...review, content: '더 좋아졌어요' };
    updateReview.mockResolvedValue(updated);

    render(<ReviewCard review={review} isMine onUpdated={onUpdated} onDeleted={vi.fn()} />);

    await userEvent.click(screen.getByText('수정'));
    const textarea = screen.getByLabelText('후기 내용');
    await userEvent.clear(textarea);
    await userEvent.type(textarea, '더 좋아졌어요');
    await userEvent.click(screen.getByText('저장'));

    await vi.waitFor(() =>
      expect(updateReview).toHaveBeenCalledWith(1, { content: '더 좋아졌어요' })
    );
    expect(onUpdated).toHaveBeenCalledWith(updated);
  });

  it('수정 취소를 누르면 원래 내용으로 되돌아간다', async () => {
    render(<ReviewCard review={review} isMine onUpdated={vi.fn()} onDeleted={vi.fn()} />);

    await userEvent.click(screen.getByText('수정'));
    const textarea = screen.getByLabelText('후기 내용');
    await userEvent.clear(textarea);
    await userEvent.type(textarea, '수정 중...');
    await userEvent.click(screen.getByText('취소'));

    expect(screen.getByText('좋았어요')).toBeInTheDocument();
    expect(updateReview).not.toHaveBeenCalled();
  });

  it('삭제를 누르고 다시 삭제를 확인하면 deleteReview를 호출하고 onDeleted를 실행한다', async () => {
    const onDeleted = vi.fn();
    deleteReview.mockResolvedValue(undefined);

    render(<ReviewCard review={review} isMine onUpdated={vi.fn()} onDeleted={onDeleted} />);

    await userEvent.click(screen.getByText('삭제'));
    expect(screen.getByText('삭제할까요?')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '삭제' }));

    await vi.waitFor(() => expect(deleteReview).toHaveBeenCalledWith(1));
    expect(onDeleted).toHaveBeenCalledWith(1);
  });

  it('저장 실패 시 에러 메시지를 보여준다', async () => {
    updateReview.mockRejectedValue(new Error('network error'));

    render(<ReviewCard review={review} isMine onUpdated={vi.fn()} onDeleted={vi.fn()} />);

    await userEvent.click(screen.getByText('수정'));
    await userEvent.click(screen.getByText('저장'));

    expect(await screen.findByText('알 수 없는 오류가 발생했습니다.')).toBeInTheDocument();
  });
});

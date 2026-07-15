// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import BackButton from './BackButton';

const back = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ back }),
}));

beforeEach(() => {
  back.mockClear();
});

describe('BackButton', () => {
  it('기본 라벨 "돌아가기"를 렌더링한다', () => {
    render(<BackButton />);
    expect(screen.getByText('← 돌아가기')).toBeInTheDocument();
  });

  it('label prop을 전달하면 해당 텍스트를 렌더링한다', () => {
    render(<BackButton label="목록으로" />);
    expect(screen.getByText('← 목록으로')).toBeInTheDocument();
  });

  it('클릭하면 router.back()을 호출한다', async () => {
    render(<BackButton />);

    await userEvent.click(screen.getByRole('button'));

    expect(back).toHaveBeenCalledTimes(1);
  });
});

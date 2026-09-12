// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import MonthNav from './MonthNav';

describe('MonthNav', () => {
  it('연/월을 표시하고 이전/다음 달 버튼에 라벨을 붙인다', () => {
    render(<MonthNav year={2024} month={5} onPrev={vi.fn()} onNext={vi.fn()} />);

    expect(screen.getByText('2024년 5월')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '이전 달' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '다음 달' })).toBeInTheDocument();
  });

  it('이전/다음 달 버튼 클릭 시 각각의 콜백을 호출한다', async () => {
    const onPrev = vi.fn();
    const onNext = vi.fn();
    render(<MonthNav year={2024} month={5} onPrev={onPrev} onNext={onNext} />);

    await userEvent.click(screen.getByRole('button', { name: '이전 달' }));
    expect(onPrev).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole('button', { name: '다음 달' }));
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});

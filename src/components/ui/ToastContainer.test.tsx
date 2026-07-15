// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import ToastContainer from './ToastContainer';
import { useToastStore } from '@/lib/store/toast';

beforeEach(() => {
  useToastStore.setState({ toasts: [] });
});

describe('ToastContainer', () => {
  it('토스트가 없으면 아무것도 렌더링하지 않는다', () => {
    const { container } = render(<ToastContainer />);
    expect(container).toBeEmptyDOMElement();
  });

  it('스토어에 담긴 토스트를 렌더링한다', () => {
    useToastStore.getState().showToast('success', '예약이 완료되었습니다');

    render(<ToastContainer />);

    expect(screen.getByRole('alert')).toHaveTextContent('예약이 완료되었습니다');
  });

  it('클릭하면 해당 토스트를 dismiss한다', async () => {
    useToastStore.getState().showToast('success', '예약이 완료되었습니다');
    render(<ToastContainer />);

    await userEvent.click(screen.getByRole('alert'));

    expect(useToastStore.getState().toasts).toHaveLength(0);
  });
});

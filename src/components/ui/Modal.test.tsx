// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Modal, { ModalHeader } from './Modal';

describe('Modal', () => {
  it('children을 role="dialog"로 렌더링한다', () => {
    render(
      <Modal onClose={vi.fn()} labelId="test-title">
        <p>모달 내용</p>
      </Modal>
    );

    expect(screen.getByRole('dialog')).toHaveTextContent('모달 내용');
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby', 'test-title');
  });

  it('오버레이를 클릭하면 onClose를 호출한다', async () => {
    const onClose = vi.fn();
    render(
      <Modal onClose={onClose} labelId="test-title">
        <p>모달 내용</p>
      </Modal>
    );

    const overlay = screen.getByRole('dialog').firstChild as HTMLElement;
    await userEvent.click(overlay);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('Escape 키를 누르면 onClose를 호출한다', async () => {
    const onClose = vi.fn();
    render(
      <Modal onClose={onClose} labelId="test-title">
        <p>모달 내용</p>
      </Modal>
    );

    await userEvent.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('ModalHeader', () => {
  it('제목을 렌더링하고 닫기 버튼 클릭 시 onClose를 호출한다', async () => {
    const onClose = vi.fn();
    render(<ModalHeader id="header-title" title="예약 대상 추가" onClose={onClose} />);

    expect(screen.getByText('예약 대상 추가')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '닫기' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

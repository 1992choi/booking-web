// @vitest-environment jsdom
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useEscapeKey } from './useEscapeKey';

function pressEscape() {
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
}

describe('useEscapeKey', () => {
  it('Escape 키를 누르면 콜백을 호출한다', () => {
    const onEscape = vi.fn();
    renderHook(() => useEscapeKey(onEscape));

    pressEscape();

    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it('Escape가 아닌 키는 콜백을 호출하지 않는다', () => {
    const onEscape = vi.fn();
    renderHook(() => useEscapeKey(onEscape));

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(onEscape).not.toHaveBeenCalled();
  });

  it('언마운트 후에는 콜백을 호출하지 않는다', () => {
    const onEscape = vi.fn();
    const { unmount } = renderHook(() => useEscapeKey(onEscape));

    unmount();
    pressEscape();

    expect(onEscape).not.toHaveBeenCalled();
  });
});

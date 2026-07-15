import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useToastStore } from './toast';

beforeEach(() => {
  useToastStore.setState({ toasts: [] });
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('showToast', () => {
  it('토스트를 목록에 추가한다', () => {
    useToastStore.getState().showToast('success', '예약이 완료되었습니다');

    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(1);
    expect(toasts[0]).toMatchObject({ type: 'success', message: '예약이 완료되었습니다' });
  });

  it('여러 토스트를 순서대로 쌓는다', () => {
    useToastStore.getState().showToast('success', '첫번째');
    useToastStore.getState().showToast('error', '두번째');

    const { toasts } = useToastStore.getState();
    expect(toasts.map((t) => t.message)).toEqual(['첫번째', '두번째']);
  });

  it('4초 후 자동으로 사라진다', () => {
    useToastStore.getState().showToast('success', '예약이 완료되었습니다');
    expect(useToastStore.getState().toasts).toHaveLength(1);

    vi.advanceTimersByTime(4000);

    expect(useToastStore.getState().toasts).toHaveLength(0);
  });
});

describe('dismissToast', () => {
  it('지정한 id의 토스트만 제거한다', () => {
    useToastStore.getState().showToast('success', '첫번째');
    useToastStore.getState().showToast('error', '두번째');
    const [first, second] = useToastStore.getState().toasts;

    useToastStore.getState().dismissToast(first.id);

    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].id).toBe(second.id);
  });
});

// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useQueryParamState } from './useQueryParamState';

const replace = vi.fn();
let searchParams = new URLSearchParams();
vi.mock('next/navigation', () => ({
  usePathname: () => '/example',
  useRouter: () => ({ replace }),
  useSearchParams: () => searchParams,
}));

describe('useQueryParamState', () => {
  it('쿼리 파라미터가 없으면 기본값으로 초기화된다', () => {
    searchParams = new URLSearchParams();
    const { result } = renderHook(() => useQueryParamState('tab', 'ALL', ['ALL', 'A', 'B'] as const));

    expect(result.current[0]).toBe('ALL');
  });

  it('URL에 허용된 값이 있으면 해당 값으로 초기화된다', () => {
    searchParams = new URLSearchParams('tab=A');
    const { result } = renderHook(() => useQueryParamState('tab', 'ALL', ['ALL', 'A', 'B'] as const));

    expect(result.current[0]).toBe('A');
  });

  it('URL에 허용되지 않은 값이 있으면 기본값으로 초기화된다', () => {
    searchParams = new URLSearchParams('tab=UNKNOWN');
    const { result } = renderHook(() => useQueryParamState('tab', 'ALL', ['ALL', 'A', 'B'] as const));

    expect(result.current[0]).toBe('ALL');
  });

  it('값을 변경하면 상태와 URL 쿼리를 함께 갱신한다', () => {
    searchParams = new URLSearchParams();
    replace.mockReset();
    const { result } = renderHook(() => useQueryParamState('tab', 'ALL', ['ALL', 'A', 'B'] as const));

    act(() => result.current[1]('A'));

    expect(result.current[0]).toBe('A');
    expect(replace).toHaveBeenCalledWith('/example?tab=A', { scroll: false });
  });

  it('기본값으로 변경하면 쿼리 파라미터를 제거한다', () => {
    searchParams = new URLSearchParams('tab=A');
    replace.mockReset();
    const { result } = renderHook(() => useQueryParamState('tab', 'ALL', ['ALL', 'A', 'B'] as const));

    act(() => result.current[1]('ALL'));

    expect(result.current[0]).toBe('ALL');
    expect(replace).toHaveBeenCalledWith('/example', { scroll: false });
  });
});

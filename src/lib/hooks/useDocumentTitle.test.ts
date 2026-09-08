// @vitest-environment jsdom
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useDocumentTitle } from './useDocumentTitle';

describe('useDocumentTitle', () => {
  it('마운트 시 document.title을 "{title} | Bookit" 형식으로 설정한다', () => {
    renderHook(() => useDocumentTitle('내 정보'));

    expect(document.title).toBe('내 정보 | Bookit');
  });

  it('title이 바뀌면 document.title도 갱신된다', () => {
    const { rerender } = renderHook(({ title }) => useDocumentTitle(title), {
      initialProps: { title: '업체 상세' },
    });
    expect(document.title).toBe('업체 상세 | Bookit');

    rerender({ title: '한적한 펜션' });

    expect(document.title).toBe('한적한 펜션 | Bookit');
  });
});

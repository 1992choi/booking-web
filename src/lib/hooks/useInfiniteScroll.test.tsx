// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useInfiniteScroll } from './useInfiniteScroll';
import { mockIntersectionObserver } from '@/lib/test-utils/mockIntersectionObserver';

function Sentinel({
  hasNextPage,
  isFetchingNextPage = false,
  onLoadMore,
}: {
  hasNextPage: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore: () => void;
}) {
  const sentinelRef = useInfiniteScroll({ hasNextPage, isFetchingNextPage, onLoadMore });
  return <div data-testid="sentinel" ref={sentinelRef} />;
}

let io: ReturnType<typeof mockIntersectionObserver>;

beforeEach(() => {
  io = mockIntersectionObserver();
});

describe('useInfiniteScroll', () => {
  it('hasNextPage가 true면 sentinel을 observe한다', () => {
    render(<Sentinel hasNextPage onLoadMore={vi.fn()} />);

    expect(io.observe).toHaveBeenCalledTimes(1);
  });

  it('hasNextPage가 false면 observe하지 않는다', () => {
    render(<Sentinel hasNextPage={false} onLoadMore={vi.fn()} />);

    expect(io.observe).not.toHaveBeenCalled();
  });

  it('sentinel이 화면에 보이면 onLoadMore를 호출한다', () => {
    const onLoadMore = vi.fn();
    render(<Sentinel hasNextPage onLoadMore={onLoadMore} />);

    io.trigger(true);

    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it('화면에 보이지 않으면 onLoadMore를 호출하지 않는다', () => {
    const onLoadMore = vi.fn();
    render(<Sentinel hasNextPage onLoadMore={onLoadMore} />);

    io.trigger(false);

    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it('이미 다음 페이지를 불러오는 중이면 다시 호출하지 않는다', () => {
    const onLoadMore = vi.fn();
    render(<Sentinel hasNextPage isFetchingNextPage onLoadMore={onLoadMore} />);

    io.trigger(true);

    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it('언마운트 시 observer 연결을 끊는다', () => {
    const { unmount } = render(<Sentinel hasNextPage onLoadMore={vi.fn()} />);

    unmount();

    expect(io.disconnect).toHaveBeenCalledTimes(1);
  });
});

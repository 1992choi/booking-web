// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Skeleton, { SkeletonList } from './Skeleton';

describe('Skeleton', () => {
  it('전달한 className을 병합해 렌더링한다', () => {
    const { container } = render(<Skeleton className="h-20 rounded-2xl" />);
    const el = container.firstElementChild;

    expect(el).toHaveClass('bg-gray-100', 'animate-pulse', 'h-20', 'rounded-2xl');
  });
});

describe('SkeletonList', () => {
  it('count만큼 스켈레톤 항목을 렌더링한다', () => {
    const { container } = render(<SkeletonList count={3} itemClassName="h-20 rounded-2xl" />);

    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(3);
  });

  it('기본 컨테이너 className은 space-y-3이다', () => {
    const { container } = render(<SkeletonList count={2} itemClassName="h-20" />);

    expect(container.firstElementChild).toHaveClass('space-y-3');
  });

  it('className을 전달하면 컨테이너 레이아웃을 교체할 수 있다', () => {
    const { container } = render(
      <SkeletonList count={4} itemClassName="aspect-square rounded-2xl" className="grid grid-cols-2 gap-4" />
    );

    expect(container.firstElementChild).toHaveClass('grid', 'grid-cols-2', 'gap-4');
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(4);
  });
});

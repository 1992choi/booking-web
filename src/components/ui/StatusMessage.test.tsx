// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmptyText, ErrorText } from './StatusMessage';

describe('ErrorText', () => {
  it('빨간색 안내 텍스트를 렌더링한다', () => {
    render(<ErrorText>불러오지 못했습니다.</ErrorText>);
    const el = screen.getByText('불러오지 못했습니다.');

    expect(el).toHaveClass('text-red-400', 'text-center');
  });

  it('전달한 className을 병합한다', () => {
    render(<ErrorText className="py-16">에러</ErrorText>);

    expect(screen.getByText('에러')).toHaveClass('py-16');
  });
});

describe('EmptyText', () => {
  it('회색 안내 텍스트를 렌더링한다', () => {
    render(<EmptyText>내역이 없습니다.</EmptyText>);
    const el = screen.getByText('내역이 없습니다.');

    expect(el).toHaveClass('text-gray-400', 'text-center');
  });

  it('전달한 className을 병합한다', () => {
    render(<EmptyText className="py-16">없음</EmptyText>);

    expect(screen.getByText('없음')).toHaveClass('py-16');
  });
});

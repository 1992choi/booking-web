// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Row from './Row';

describe('Row', () => {
  it('label과 children을 렌더링한다', () => {
    render(<Row label="가격">10,000원</Row>);

    expect(screen.getByText('가격')).toBeInTheDocument();
    expect(screen.getByText('10,000원')).toBeInTheDocument();
  });
});

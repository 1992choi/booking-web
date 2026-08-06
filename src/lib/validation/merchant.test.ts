import { describe, expect, it } from 'vitest';
import { merchantSchema, resourceSchema, availableTimeSchema } from './merchant';

describe('merchantSchema', () => {
  const valid = { name: '한적한 펜션', phone: '010-1234-5678', type: 'PENSION' as const };

  it('유효한 입력은 통과한다', () => {
    expect(merchantSchema.safeParse(valid).success).toBe(true);
  });

  it('업체명이 비어 있으면 실패한다', () => {
    expect(merchantSchema.safeParse({ ...valid, name: '' }).success).toBe(false);
  });

  it('전화번호 형식이 아니면 실패한다', () => {
    expect(merchantSchema.safeParse({ ...valid, phone: '02-1234-5678' }).success).toBe(false);
  });

  it('유형이 정의된 값이 아니면 실패한다', () => {
    expect(merchantSchema.safeParse({ ...valid, type: 'HOTEL' }).success).toBe(false);
  });
});

describe('resourceSchema', () => {
  const valid = { name: 'A동', description: '', price: 10000, maxCapacity: 4 };

  it('유효한 입력은 통과한다', () => {
    expect(resourceSchema.safeParse(valid).success).toBe(true);
  });

  it('이름이 비어 있으면 실패한다', () => {
    expect(resourceSchema.safeParse({ ...valid, name: '' }).success).toBe(false);
  });

  it('문자열 숫자 입력을 숫자로 변환한다', () => {
    const result = resourceSchema.safeParse({ ...valid, price: '10000', maxCapacity: '4' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.price).toBe(10000);
      expect(result.data.maxCapacity).toBe(4);
    }
  });

  it('가격이 음수면 실패한다', () => {
    expect(resourceSchema.safeParse({ ...valid, price: -1 }).success).toBe(false);
  });

  it('최대 인원이 0이면 실패한다', () => {
    expect(resourceSchema.safeParse({ ...valid, maxCapacity: 0 }).success).toBe(false);
  });
});

describe('availableTimeSchema', () => {
  it('종료 시간이 시작 시간보다 늦으면 통과한다', () => {
    const result = availableTimeSchema.safeParse({
      startTime: '2024-05-01T09:00',
      endTime: '2024-05-01T10:00',
    });
    expect(result.success).toBe(true);
  });

  it('종료 시간이 시작 시간보다 이르거나 같으면 endTime 경로로 실패한다', () => {
    const result = availableTimeSchema.safeParse({
      startTime: '2024-05-01T09:00',
      endTime: '2024-05-01T09:00',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['endTime']);
      expect(result.error.issues[0].message).toBe('종료 시간은 시작 시간보다 늦어야 합니다.');
    }
  });
});

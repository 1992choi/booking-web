import { describe, expect, it } from 'vitest';
import { schema } from './page';

const validForm = {
  name: '홍길동',
  email: 'hong@example.com',
  phone: '010-1234-5678',
  password: 'password123',
  passwordConfirm: 'password123',
};

describe('signup schema', () => {
  it('유효한 입력은 통과한다', () => {
    const result = schema.safeParse(validForm);
    expect(result.success).toBe(true);
  });

  it('이름이 비어 있으면 실패한다', () => {
    const result = schema.safeParse({ ...validForm, name: '' });
    expect(result.success).toBe(false);
  });

  it('이메일 형식이 아니면 실패한다', () => {
    const result = schema.safeParse({ ...validForm, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  describe('전화번호 형식', () => {
    it.each(['010-1234-5678', '01012345678', '011-123-4567', '019-1234-5678'])(
      '%s 는 유효하다',
      (phone) => {
        expect(schema.safeParse({ ...validForm, phone }).success).toBe(true);
      }
    );

    it.each(['02-1234-5678', '010-12-3456', '010-12345-6789', '전화번호'])(
      '%s 는 무효하다',
      (phone) => {
        expect(schema.safeParse({ ...validForm, phone }).success).toBe(false);
      }
    );
  });

  it('비밀번호가 8자 미만이면 실패한다', () => {
    const result = schema.safeParse({ ...validForm, password: '1234567', passwordConfirm: '1234567' });
    expect(result.success).toBe(false);
  });

  it('비밀번호와 비밀번호 확인이 다르면 passwordConfirm 경로로 실패한다', () => {
    const result = schema.safeParse({ ...validForm, password: 'password123', passwordConfirm: 'different123' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['passwordConfirm']);
      expect(result.error.issues[0].message).toBe('비밀번호가 일치하지 않습니다.');
    }
  });
});

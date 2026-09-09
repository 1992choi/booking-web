import { z } from 'zod';

export const phoneSchema = z
  .string()
  .min(1, '전화번호를 입력해 주세요.')
  .regex(/^01[016-9]-?\d{3,4}-?\d{4}$/, '올바른 전화번호 형식이 아닙니다.');

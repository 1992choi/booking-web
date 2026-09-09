import { z } from 'zod';
import { phoneSchema } from './common';

export const loginSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다.'),
  password: z.string().min(1, '비밀번호를 입력해 주세요.'),
});

export const signupSchema = z
  .object({
    name: z.string().min(1, '이름을 입력해 주세요.'),
    email: z.string().email('올바른 이메일 형식이 아닙니다.'),
    phone: phoneSchema,
    password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다.'),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['passwordConfirm'],
  });

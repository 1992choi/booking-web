import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다.'),
  password: z.string().min(1, '비밀번호를 입력해 주세요.'),
});

export const signupSchema = z
  .object({
    name: z.string().min(1, '이름을 입력해 주세요.'),
    email: z.string().email('올바른 이메일 형식이 아닙니다.'),
    phone: z
      .string()
      .min(1, '전화번호를 입력해 주세요.')
      .regex(/^01[016-9]-?\d{3,4}-?\d{4}$/, '올바른 전화번호 형식이 아닙니다.'),
    password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다.'),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['passwordConfirm'],
  });

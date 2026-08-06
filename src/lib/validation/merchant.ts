import { z } from 'zod';

export const merchantSchema = z.object({
  name: z.string().min(1, '업체명을 입력해 주세요.'),
  phone: z
    .string()
    .min(1, '전화번호를 입력해 주세요.')
    .regex(/^01[016-9]-?\d{3,4}-?\d{4}$/, '올바른 전화번호 형식이 아닙니다.'),
  type: z.enum(['PENSION', 'CLASS', 'FACILITY']),
});

export const resourceSchema = z.object({
  name: z.string().min(1, '이름을 입력해 주세요.'),
  description: z.string(),
  price: z.coerce.number({ invalid_type_error: '가격을 입력해 주세요.' }).min(0, '가격은 0 이상이어야 합니다.'),
  maxCapacity: z.coerce
    .number({ invalid_type_error: '최대 인원을 입력해 주세요.' })
    .min(1, '최대 인원은 1명 이상이어야 합니다.'),
});

export const availableTimeSchema = z
  .object({
    startTime: z.string().min(1, '시작 시간을 입력해 주세요.'),
    endTime: z.string().min(1, '종료 시간을 입력해 주세요.'),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: '종료 시간은 시작 시간보다 늦어야 합니다.',
    path: ['endTime'],
  });

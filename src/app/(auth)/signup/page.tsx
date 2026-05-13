'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signup } from '@/lib/api/auth';
import { getErrorMessage } from '@/lib/api/axios';

const schema = z
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

type FormValues = z.infer<typeof schema>;

export default function SignupPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setErrorMsg('');
    try {
      await signup({
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
      });
      router.push('/login?registered=1');
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">회원가입</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* 이름 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
          <input
            {...register('name')}
            type="text"
            placeholder="홍길동"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
        </div>

        {/* 이메일 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
          <input
            {...register('email')}
            type="email"
            placeholder="example@email.com"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>

        {/* 전화번호 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
          <input
            {...register('phone')}
            type="tel"
            placeholder="010-1234-5678"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
        </div>

        {/* 비밀번호 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
          <input
            {...register('password')}
            type="password"
            placeholder="8자 이상 입력해 주세요."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        {/* 비밀번호 확인 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호 확인</label>
          <input
            {...register('passwordConfirm')}
            type="password"
            placeholder="비밀번호를 한 번 더 입력해 주세요."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.passwordConfirm && (
            <p className="mt-1 text-xs text-red-500">{errors.passwordConfirm.message}</p>
          )}
        </div>

        {/* 서버 에러 */}
        {errorMsg && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-lg py-2.5 text-sm transition-colors"
        >
          {isSubmitting ? '처리 중...' : '가입하기'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="text-blue-600 hover:underline font-medium">
          로그인
        </Link>
      </p>
    </div>
  );
}

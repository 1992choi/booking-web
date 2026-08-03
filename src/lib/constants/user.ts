import type { Role } from '@/lib/types/auth';

export const ROLE_LABELS: Record<Role, string> = {
  USER: '일반 회원',
  MERCHANT: '업체 운영자',
  ADMIN: '관리자',
};

export const ROLE_COLORS: Record<Role, string> = {
  USER: 'bg-gray-100 text-gray-500',
  MERCHANT: 'bg-blue-50 text-blue-600',
  ADMIN: 'bg-purple-50 text-purple-600',
};

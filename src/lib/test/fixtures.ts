import type { UserResponse } from '@/lib/types/auth';

export const testUser: UserResponse = {
  id: 1,
  name: '홍길동',
  email: 'hong@example.com',
  phone: '010-1234-5678',
  role: 'USER',
  createdAt: '2024-01-15T10:30:00',
};

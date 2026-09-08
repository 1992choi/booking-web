import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from './proxy';

function makeToken(payload: Record<string, unknown>): string {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64');
  return `header.${body}.signature`;
}

const futureExp = Math.floor(Date.now() / 1000) + 3600;
const pastExp = Math.floor(Date.now() / 1000) - 3600;

function makeRequest(pathname: string, token?: string): NextRequest {
  const headers = token ? { cookie: `access-token=${token}` } : undefined;
  return new NextRequest(new URL(pathname, 'http://localhost:3333'), { headers });
}

describe('proxy', () => {
  it('보호되지 않은 라우트는 토큰 없이 통과한다', () => {
    const res = proxy(makeRequest('/login'));

    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });

  it('보호된 라우트에 토큰이 없으면 /login으로 리다이렉트한다', () => {
    const res = proxy(makeRequest('/my'));

    expect(res.status).toBe(307);
    const location = new URL(res.headers.get('location')!);
    expect(location.pathname).toBe('/login');
    expect(location.searchParams.get('redirect')).toBe('/my');
  });

  it('만료된 토큰이면 /login으로 리다이렉트한다', () => {
    const token = makeToken({ role: 'USER', exp: pastExp });
    const res = proxy(makeRequest('/my', token));

    expect(res.status).toBe(307);
    expect(new URL(res.headers.get('location')!).pathname).toBe('/login');
  });

  it('손상된(디코딩 불가) 토큰이면 /login으로 리다이렉트한다', () => {
    const res = proxy(makeRequest('/my', 'not-a-valid-jwt'));

    expect(res.status).toBe(307);
    expect(new URL(res.headers.get('location')!).pathname).toBe('/login');
  });

  it('USER role은 /merchant 접근 시 홈으로 리다이렉트한다', () => {
    const token = makeToken({ role: 'USER', exp: futureExp });
    const res = proxy(makeRequest('/merchant/1', token));

    expect(res.status).toBe(307);
    expect(new URL(res.headers.get('location')!).pathname).toBe('/');
  });

  it('MERCHANT role은 /merchant를 통과한다', () => {
    const token = makeToken({ role: 'MERCHANT', exp: futureExp });
    const res = proxy(makeRequest('/merchant/1', token));

    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });

  it('MERCHANT role은 /admin 접근 시 홈으로 리다이렉트한다', () => {
    const token = makeToken({ role: 'MERCHANT', exp: futureExp });
    const res = proxy(makeRequest('/admin/users', token));

    expect(res.status).toBe(307);
    expect(new URL(res.headers.get('location')!).pathname).toBe('/');
  });

  it('ADMIN role은 /merchant, /admin 모두 통과한다', () => {
    const token = makeToken({ role: 'ADMIN', exp: futureExp });

    expect(proxy(makeRequest('/merchant/1', token)).headers.get('location')).toBeNull();
    expect(proxy(makeRequest('/admin/users', token)).headers.get('location')).toBeNull();
  });

  it('유효한 토큰으로 /my에 접근하면 통과한다', () => {
    const token = makeToken({ role: 'USER', exp: futureExp });
    const res = proxy(makeRequest('/my', token));

    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });
});

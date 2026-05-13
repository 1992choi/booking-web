import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** Routes that require authentication */
const PROTECTED_PREFIXES = ['/my', '/owner', '/admin'];

/** Routes that require OWNER role */
const OWNER_ONLY_PREFIXES = ['/owner'];

/** Routes that require ADMIN role */
const ADMIN_ONLY_PREFIXES = ['/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('access-token')?.value;

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isProtected && !token) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based checks require decoding the JWT.
  // We do a lightweight base64 decode here (no verify — server routes must also guard).
  if (token && isProtected) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role: string = payload.role ?? '';

      const needsOwner = OWNER_ONLY_PREFIXES.some((p) => pathname.startsWith(p));
      const needsAdmin = ADMIN_ONLY_PREFIXES.some((p) => pathname.startsWith(p));

      if (needsAdmin && role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', request.url));
      }
      if (needsOwner && role !== 'OWNER' && role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch {
      // Malformed token — treat as unauthenticated
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/my/:path*', '/owner/:path*', '/admin/:path*'],
};

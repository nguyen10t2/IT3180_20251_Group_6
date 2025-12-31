import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_PATHS = ['/signin', '/signup', '/forgot-password', '/reset-password', '/otp', '/verify-otp-reset'];
const MANAGER_ROLES = ['manager', 'admin'];

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
} as const;

function createResponseWithHeaders(response: NextResponse = NextResponse.next()) {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

function isAuthPath(pathname: string) {
  return AUTH_PATHS.some(path => pathname.startsWith(path));
}

function isManagerRole(role: string | undefined) {
  return role ? MANAGER_ROLES.includes(role) : false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userRole = request.cookies.get('userRole')?.value;
  const isAuthenticated = request.cookies.get('isAuthenticated')?.value === 'true';

  if (isAuthenticated && isAuthPath(pathname)) {
    const redirectUrl = isManagerRole(userRole) ? '/manager/dashboard' : '/resident/home';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  if (!isAuthenticated && (pathname.startsWith('/manager') || pathname.startsWith('/resident'))) {
    const url = new URL('/signin', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }
  
  if (isAuthenticated && userRole) {
    const isResidentAccessingManager = pathname.startsWith('/manager') && userRole === 'resident';
    const isManagerAccessingResident = pathname.startsWith('/resident') && isManagerRole(userRole);

    if (isResidentAccessingManager) {
      return NextResponse.redirect(new URL('/resident/home', request.url));
    }
    if (isManagerAccessingResident) {
      return NextResponse.redirect(new URL('/manager/dashboard', request.url));
    }
  }

  return createResponseWithHeaders();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)'],
};

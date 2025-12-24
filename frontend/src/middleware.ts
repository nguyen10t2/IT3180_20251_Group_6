import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected and public paths
const residentPaths = ['/resident/home', '/resident/account', '/resident/notifications', '/resident/invoices', '/resident/feedback', '/resident/settings'];
const managerPaths = ['/manager'];
const authPaths = ['/signin', '/signup', '/forgot-password', '/reset-password', '/otp', '/verify-otp-reset'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Add security headers
  const response = NextResponse.next();
  
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
};

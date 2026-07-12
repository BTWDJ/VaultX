import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Extract session token from cookies
  const sessionToken = 
    request.cookies.get('better-auth.session_token')?.value ||
    request.cookies.get('better-auth.session-token')?.value ||
    request.cookies.get('__secure-better-auth.session-token')?.value ||
    request.cookies.get('__secure-better-auth.session_token')?.value;

  const { pathname } = request.nextUrl;

  // Determine paths
  const isProtectedPath = 
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/vault') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/admin');

  const isAuthPath = 
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password';

  // Redirect Logic
  if (isProtectedPath && !sessionToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthPath && sessionToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/vault/:path*',
    '/settings/:path*',
    '/profile/:path*',
    '/admin/:path*',
    '/login',
    '/register',
    '/forgot-password',
  ],
};

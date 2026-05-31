import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/server';

const neonAuthMiddleware = auth.middleware({ loginUrl: '/auth/sign-in' });

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public routes — skip auth middleware entirely
  if (
    pathname === '/' ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }
  
  // Protected routes — use Neon Auth middleware for session refresh + protection
  return neonAuthMiddleware(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

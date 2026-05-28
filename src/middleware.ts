import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-production-key-here-12345";

export async function middleware(request: NextRequest) {
  // Extract path
  const path = request.nextUrl.pathname;

  // Paths that require authentication and admin role (e.g. /dashboard or other protected routes)
  const isProtectedPath = path.startsWith('/dashboard') || path.startsWith('/docs'); // Assuming docs and dashboard are protected

  if (isProtectedPath) {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      // No token found, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Verify token
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);

      // Check for admin role
      if (payload.role !== 'admin' && payload.role !== 'SUPER_ADMIN' && payload.role !== 'ADMIN') {
        // Not an admin, redirect to a denied page or back to login
        return NextResponse.redirect(new URL('/login', request.url));
      }

      // Valid token and role, allow access
      return NextResponse.next();
    } catch (error) {
      // Invalid token (expired, malformed, etc.), redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      // Delete the invalid cookie
      response.cookies.delete('auth_token');
      return response;
    }
  }

  // Allow all other public routes to proceed
  return NextResponse.next();
}

// Specify which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     * - register (register page)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|login|register).*)',
  ],
};


// File: middleware.js (Next.js middleware for route protection)
import { NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

export function middleware(request) {
  // Check if it's an API route that needs authentication
  if (request.nextUrl.pathname.startsWith('/api/protected/')) {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { message: 'No token provided' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Add user ID to headers for downstream handlers
    const response = NextResponse.next();
    response.headers.set('x-user-id', decoded.userId);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/protected/:path*']
};
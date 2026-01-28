import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Simple middleware without Supabase for now
  // Authentication will be handled in the pages/API routes

  console.log('Middleware running for:', pathname);

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login'
  ]
};

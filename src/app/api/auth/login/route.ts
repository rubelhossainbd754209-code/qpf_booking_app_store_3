import { NextRequest, NextResponse } from 'next/server';
import { signInAdmin } from '@/lib/local-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log('Attempting login with:', email);

    // Use local authentication
    const { user, error, token } = await signInAdmin(email, password);

    if (error || !user || !token) {
      console.log('Login failed:', error);
      return NextResponse.json(
        { error: error || 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('Login successful for admin:', email);

    // Create response with auth cookie
    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        user: { email: user.email, role: 'admin' }
      },
      { status: 200 }
    );

    // Set auth cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

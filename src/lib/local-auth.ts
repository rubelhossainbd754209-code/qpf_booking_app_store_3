import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Default admin credentials - can be overridden via environment variables
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@qpx.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const JWT_SECRET = process.env.JWT_SECRET || 'qpf-secret-key-2024-local-dev';

export interface AdminUser {
  email: string;
  role: 'admin';
  id: string;
}

// Verify password (for demo, we use plain text comparison, in production use bcrypt)
export async function verifyPassword(password: string): Promise<boolean> {
  // For local development, just compare plain text
  return password === ADMIN_PASSWORD;
}

// Sign in admin with local credentials
export async function signInAdmin(email: string, password: string) {
  try {
    console.log('Attempting local sign in with:', email);

    // Check email
    if (email !== ADMIN_EMAIL) {
      console.log('Email does not match admin email');
      return { user: null, error: 'Invalid email or password', token: null };
    }

    // Check password
    const isValid = await verifyPassword(password);
    if (!isValid) {
      console.log('Password does not match');
      return { user: null, error: 'Invalid email or password', token: null };
    }

    // Create JWT token
    const user: AdminUser = {
      id: 'local-admin-1',
      email: ADMIN_EMAIL,
      role: 'admin'
    };

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('Local admin login successful');
    return { user, error: null, token };
  } catch (error) {
    console.error('Local login error:', error);
    return { user: null, error: 'Login failed', token: null };
  }
}

// Sign out admin
export async function signOutAdmin() {
  try {
    // Token will be cleared on the client side
    return { error: null };
  } catch (error) {
    console.error('Signout error:', error);
    return { error: 'Signout failed' };
  }
}

// Verify JWT token and get current user
export async function getCurrentUser(): Promise<AdminUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      role: 'admin';
    };

    if (decoded.email === ADMIN_EMAIL && decoded.role === 'admin') {
      return {
        id: decoded.userId,
        email: decoded.email,
        role: 'admin'
      };
    }

    return null;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

// Verify token from header
export async function verifyToken(token: string): Promise<AdminUser | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      role: 'admin';
    };

    if (decoded.email === ADMIN_EMAIL && decoded.role === 'admin') {
      return {
        id: decoded.userId,
        email: decoded.email,
        role: 'admin'
      };
    }

    return null;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export function isValidAdmin(user: AdminUser | null): boolean {
  return user !== null && user.role === 'admin' && user.email === ADMIN_EMAIL;
}

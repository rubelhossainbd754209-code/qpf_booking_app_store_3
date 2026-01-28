import { NextResponse } from 'next/server';
import { STORE_ID, STORE_NAME, STORE_CODE, LARAVEL_API_URL } from '@/lib/api-config';

export async function GET() {
    return NextResponse.json({
        config: {
            STORE_ID,
            STORE_NAME,
            STORE_CODE,
            LARAVEL_API_URL: LARAVEL_API_URL ? 'SET (Redacted for security)' : 'NOT SET',
            HAS_API_KEY: !!process.env.NEXT_PUBLIC_LARAVEL_API_KEY,
            ENVIRONMENT: process.env.NODE_ENV,
        },
        supabase: {
            URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
            KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
        },
        timestamp: new Date().toISOString()
    });
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { supabaseUrl, supabaseAnonKey } = body;

        if (!supabaseUrl || !supabaseAnonKey) {
            return NextResponse.json({
                success: false,
                error: 'Missing Supabase URL or Anon Key'
            }, { status: 400 });
        }

        // Try to create a client and perform a simple query
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        // We try to fetch from a common table or just check the connection
        // Let's try to fetch from 'repair_requests' as it's our target table
        const { error } = await supabase
            .from('repair_requests')
            .select('id')
            .limit(1);

        if (error) {
            // If the error refers to the table not being found, the connection is actually OK!
            const isTableMissing =
                error.code === 'PGRST116' ||
                error.message.includes('relation "repair_requests" does not exist') ||
                error.message.includes('Could not find the table') ||
                error.message.includes('schema cache');

            if (isTableMissing) {
                return NextResponse.json({
                    success: true,
                    message: 'কানেকশন সফল হয়েছে (Connection Successful)! কিন্তু ডাটাবেসে "repair_requests" টেবিলটি পাওয়া যায়নি। অনুগ্রহ করে সেটআপ স্ক্রিপ্টটি রান করুন।',
                    tableMissing: true
                });
            }

            return NextResponse.json({
                success: false,
                error: `Connection failed: ${error.message}`
            }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            message: 'Connection successful! Database is ready.'
        });

    } catch (error) {
        console.error('Supabase test error:', error);
        return NextResponse.json({
            success: false,
            error: 'Invalid URL or Key format'
        }, { status: 500 });
    }
}

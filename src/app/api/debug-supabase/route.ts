import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAppSettings } from '@/lib/settings';

// Debug API to test Supabase connection and insert
export async function GET() {
    try {
        const settings = getAppSettings();

        console.log('=== DEBUG SUPABASE ===');
        console.log('Supabase URL:', settings.supabaseUrl);
        console.log('Anon Key (first 30 chars):', settings.supabaseAnonKey?.substring(0, 30) + '...');

        if (!settings.supabaseUrl || !settings.supabaseAnonKey) {
            return NextResponse.json({
                success: false,
                error: 'Supabase not configured',
                config: {
                    hasUrl: !!settings.supabaseUrl,
                    hasKey: !!settings.supabaseAnonKey
                }
            });
        }

        // Create Supabase client
        const supabase = createClient(settings.supabaseUrl, settings.supabaseAnonKey);

        // Test 1: Try to fetch from repair_requests
        console.log('Test 1: Fetching from repair_requests...');
        const { data: fetchData, error: fetchError } = await supabase
            .from('repair_requests')
            .select('*')
            .limit(5);

        // Test 2: Try to insert a test record
        console.log('Test 2: Inserting test record...');
        const testRecord = {
            customer_name: 'DEBUG TEST',
            phone: '123-456-7890',
            brand: 'Test Brand',
            device_type: 'Test Device',
            model: 'Test Model',
            message: 'Debug test record - DELETE THIS',
            status: 'New',
            store_id: settings.storeId || 'test-store',
        };

        const { data: insertData, error: insertError } = await supabase
            .from('repair_requests')
            .insert(testRecord)
            .select()
            .single();

        return NextResponse.json({
            success: !fetchError && !insertError,
            config: {
                supabaseUrl: settings.supabaseUrl,
                anonKeyPrefix: settings.supabaseAnonKey?.substring(0, 30),
                storeId: settings.storeId
            },
            fetchTest: {
                success: !fetchError,
                recordCount: fetchData?.length || 0,
                error: fetchError?.message || null
            },
            insertTest: {
                success: !insertError,
                insertedId: insertData?.id || null,
                error: insertError?.message || null,
                fullError: insertError || null
            }
        });

    } catch (error: any) {
        console.error('Debug API error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}

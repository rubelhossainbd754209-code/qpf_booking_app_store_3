import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { getLaravelApiUrl, getLaravelApiKey, getStoreId, getStoreName, getStoreCode } from '@/lib/api-config';

// Force dynamic rendering - disable all caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Flag to control whether to forward to Laravel API
const FORWARD_TO_LARAVEL = process.env.NEXT_PUBLIC_FORWARD_TO_LARAVEL !== 'false';

// CORS headers for cross-origin requests
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key, Accept',
    'Access-Control-Max-Age': '86400',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
};

// Helper function to add CORS headers to response
function corsResponse(data: any, status: number = 200) {
    return NextResponse.json(data, { status, headers: corsHeaders });
}

// Handle OPTIONS preflight request
export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
    try {
        // Check if Supabase is configured
        if (!isSupabaseConfigured()) {
            console.log('Supabase not configured, returning empty array');
            return corsResponse({ requests: [] });
        }

        const supabase = getSupabaseClient();
        if (!supabase) {
            return corsResponse({ requests: [] });
        }

        // Fetch from Supabase
        const { data, error } = await supabase
            .from('repair_requests')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase fetch error:', error);
            return corsResponse({ error: 'Failed to fetch from database', details: error.message }, 500);
        }

        // Transform data to match frontend expectations
        const transformedRequests = (data || []).map((request: any) => ({
            id: request.id,
            customer: request.customer_name,
            brand: request.brand,
            deviceType: request.device_type,
            model: request.model,
            message: request.message,
            name: request.customer_name,
            phone: request.phone,
            email: request.email,
            address: request.address,
            status: request.status || 'New',
            createdAt: request.created_at,
            uniqueKey: `${request.id}-${request.created_at}`,
        }));

        return corsResponse({ requests: transformedRequests });
    } catch (error) {
        console.error('API error:', error);
        return corsResponse({ error: 'Failed to fetch requests' }, 500);
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log('Received booking data:', body);

        const storeId = getStoreId();
        const storeName = getStoreName();
        const storeCode = getStoreCode();
        const laravelUrl = getLaravelApiUrl();
        const laravelKey = getLaravelApiKey();

        // Check if Supabase is configured
        let supabaseRecord = null;
        let supabaseSuccess = false;

        if (isSupabaseConfigured()) {
            const supabase = getSupabaseClient();
            if (supabase) {
                // Insert into Supabase
                const { data, error } = await supabase
                    .from('repair_requests')
                    .insert({
                        customer_name: body.name,
                        phone: body.phone,
                        email: body.email || null,
                        address: body.address || null,
                        brand: body.brand,
                        device_type: body.deviceType,
                        model: body.model,
                        message: body.message || null,
                        status: 'New',
                        store_id: storeId,
                        store_name: storeName,
                        store_code: storeCode,
                    })
                    .select()
                    .single();

                if (error) {
                    console.error('Supabase insert error:', error);
                } else {
                    supabaseRecord = data;
                    supabaseSuccess = true;
                    console.log('✅ Successfully saved to Supabase:', data.id);
                }
            }
        }

        // Transform data for Laravel API with Store identification
        const laravelData = {
            // Store identification
            store_id: storeId,
            store_name: storeName,
            store_code: storeCode,

            // Customer information
            customer_name: body.name,
            customer_phone: body.phone,
            customer_email: body.email || null,
            customer_address: body.address || null,

            // Device information
            device_brand: body.brand,
            device_type: body.deviceType,
            device_model: body.model,
            issue_description: body.message || null,

            // Status and metadata
            status: 'New',
            source: 'booking_form',
            submitted_at: new Date().toISOString(),
        };

        let laravelResponse = null;
        let laravelSuccess = false;

        // Forward to Laravel API if enabled
        if (FORWARD_TO_LARAVEL && laravelUrl) {
            try {
                console.log('Forwarding booking to Laravel API:', `${laravelUrl}/bookings`);

                const response = await fetch(`${laravelUrl}/bookings`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-API-Key': laravelKey,
                    },
                    body: JSON.stringify(laravelData),
                });

                laravelResponse = await response.json().catch(() => null);
                laravelSuccess = response.ok;

                if (!laravelSuccess) {
                    console.error('❌ Laravel API Error:', laravelResponse);
                } else {
                    console.log('✅ Successfully forwarded to Laravel:', laravelResponse);
                }
            } catch (laravelError) {
                console.error('❌ Failed to forward to Laravel API:', laravelError);
            }
        }

        // Transform response for frontend
        const transformedRequest = {
            id: supabaseRecord?.id || `temp-${Date.now()}`,
            customer: body.name,
            brand: body.brand,
            deviceType: body.deviceType,
            model: body.model,
            message: body.message,
            name: body.name,
            phone: body.phone,
            email: body.email,
            address: body.address,
            status: 'New',
            createdAt: supabaseRecord?.created_at || new Date().toISOString(),
            supabaseSynced: supabaseSuccess,
            laravelSynced: laravelSuccess,
            laravelResponse: laravelResponse,
        };

        return corsResponse({ success: true, request: transformedRequest });
    } catch (error) {
        console.error('API error:', error);
        return corsResponse({ error: 'Failed to create request' }, 500);
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();
        const { ids } = body;

        if (!ids || !Array.isArray(ids)) {
            return corsResponse({ error: 'Invalid IDs provided' }, 400);
        }

        console.log('Bulk deleting requests:', ids);

        if (!isSupabaseConfigured()) {
            return corsResponse({ error: 'Supabase not configured' }, 500);
        }

        const supabase = getSupabaseClient();
        if (!supabase) {
            return corsResponse({ error: 'Failed to connect to database' }, 500);
        }

        const { error } = await supabase
            .from('repair_requests')
            .delete()
            .in('id', ids);

        if (error) {
            console.error('Supabase delete error:', error);
            return corsResponse({ error: 'Failed to delete from database', details: error.message }, 500);
        }

        return corsResponse({
            success: true,
            message: `Successfully deleted ${ids.length} request(s)`,
            deletedCount: ids.length
        });
    } catch (error) {
        console.error('API error:', error);
        return corsResponse({ error: 'Failed to delete requests' }, 500);
    }
}

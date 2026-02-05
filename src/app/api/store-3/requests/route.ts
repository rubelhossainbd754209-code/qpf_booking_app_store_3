import { NextRequest, NextResponse } from 'next/server';
import {
    getRepairRequests,
    createRepairRequest,
} from '@/lib/data';
import { getLaravelApiUrl, getLaravelApiKey, getStoreId, getStoreName, getStoreCode } from '@/lib/api-config';

// Flag to control whether to forward to Laravel API
const FORWARD_TO_LARAVEL = process.env.NEXT_PUBLIC_FORWARD_TO_LARAVEL !== 'false';

// CORS headers for cross-origin requests
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key, Accept',
    'Access-Control-Max-Age': '86400',
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
        // For Store 3, we don't fetch from Supabase (it's legacy)
        // We only fetch from local data as fallback
        const requests = getRepairRequests();

        // Transform data to match frontend expectations
        const transformedRequests = requests.map((request) => ({
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
            status: request.status,
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
        console.log('Received booking data for Store 3:', body);

        // Note: Supabase insertion DISABLED to prevent routing to Store 2
        console.log('Supabase insertion disabled for Store 3 isolation plan');

        const storeId = getStoreId();
        const storeName = getStoreName();
        const storeCode = getStoreCode();
        const laravelUrl = getLaravelApiUrl();
        const laravelKey = getLaravelApiKey();

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
                console.log('Forwarding booking to Store 3 Laravel API:', `${laravelUrl}/bookings`);

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
                    console.error('❌ Store 3 Laravel API Error:', laravelResponse);
                } else {
                    console.log('✅ Successfully forwarded to Store 3 Laravel:', laravelResponse);
                }
            } catch (laravelError) {
                console.error('❌ Failed to forward to Store 3 Laravel API:', laravelError);
            }
        } else {
            console.warn('⚠️ Forwarding skipped: FORWARD_TO_LARAVEL is false or LARAVEL_API_URL is missing');
        }

        // Always create a local fallback record for tracking
        const newRequest = createRepairRequest({
            name: body.name,
            phone: body.phone,
            email: body.email,
            address: body.address,
            brand: body.brand,
            deviceType: body.deviceType,
            model: body.model,
            message: body.message
        });

        // Transform response for frontend
        const transformedRequest = {
            id: newRequest.id,
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
            createdAt: newRequest.created_at,
            supabaseSynced: false, // Disabled by design
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

        console.log('Bulk deleting requests for Store 3:', ids);

        const { deleteRepairRequest } = await import('@/lib/data');
        let deletedCount = 0;

        for (const id of ids) {
            const success = deleteRepairRequest(id);
            if (success) deletedCount++;
        }

        return corsResponse({
            success: true,
            message: `Successfully deleted ${deletedCount} request(s)`,
            deletedCount
        });
    } catch (error) {
        console.error('API error:', error);
        return corsResponse({ error: 'Failed to delete requests' }, 500);
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';

// CORS headers for cross-origin requests
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
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

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        console.log(`[GET] Fetching request with ID: ${id}`);

        if (!isSupabaseConfigured()) {
            return corsResponse({ error: 'Supabase not configured' }, 500);
        }

        const supabase = getSupabaseClient();
        if (!supabase) {
            return corsResponse({ error: 'Failed to connect to database' }, 500);
        }

        const { data, error } = await supabase
            .from('repair_requests')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) {
            console.log(`[GET] Request not found: ${id}`);
            return corsResponse({ error: 'Request not found' }, 404);
        }

        return corsResponse({ success: true, request: data });
    } catch (error) {
        console.error('API error:', error);
        return corsResponse({ error: 'Failed to fetch request' }, 500);
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        console.log(`[PATCH] Updating request ${id}:`, body);

        if (!isSupabaseConfigured()) {
            return corsResponse({ error: 'Supabase not configured' }, 500);
        }

        const supabase = getSupabaseClient();
        if (!supabase) {
            return corsResponse({ error: 'Failed to connect to database' }, 500);
        }

        // Build update object
        const updateData: any = {};
        if (body.status) updateData.status = body.status;
        if (body.customer_name) updateData.customer_name = body.customer_name;
        if (body.phone) updateData.phone = body.phone;
        if (body.email !== undefined) updateData.email = body.email;
        if (body.address !== undefined) updateData.address = body.address;
        if (body.brand) updateData.brand = body.brand;
        if (body.device_type) updateData.device_type = body.device_type;
        if (body.model) updateData.model = body.model;
        if (body.message !== undefined) updateData.message = body.message;
        updateData.updated_at = new Date().toISOString();

        const { data, error } = await supabase
            .from('repair_requests')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error(`[PATCH] Supabase error:`, error);
            return corsResponse({ error: 'Failed to update request', details: error.message }, 500);
        }

        if (!data) {
            console.log(`[PATCH] Request not found: ${id}`);
            return corsResponse({ error: 'Request not found' }, 404);
        }

        console.log(`[PATCH] Successfully updated: ${id}`);
        return corsResponse({ success: true, request: data });
    } catch (error) {
        console.error('API error:', error);
        return corsResponse({ error: 'Failed to update request' }, 500);
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        console.log(`[DELETE] Attempting to delete request with ID: ${id}`);

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
            .eq('id', id);

        if (error) {
            console.error(`[DELETE] Supabase error:`, error);
            return corsResponse({ error: 'Failed to delete request', details: error.message }, 500);
        }

        console.log(`[DELETE] Successfully deleted: ${id}`);
        return corsResponse({ success: true, message: 'Request deleted successfully' });
    } catch (error) {
        console.error('API error:', error);
        return corsResponse({ error: 'Failed to delete request' }, 500);
    }
}

import { NextRequest, NextResponse } from 'next/server';
import {
    getRepairRequest,
    updateRepairRequest,
    deleteRepairRequest
} from '@/lib/data';

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

        const repairRequest = getRepairRequest(id);

        if (!repairRequest) {
            console.log(`[GET] Request not found: ${id}`);
            return corsResponse({ error: 'Request not found' }, 404);
        }

        return corsResponse({ success: true, request: repairRequest });
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

        console.log(`[PATCH] Updating request ${id} for Store 3:`, body);

        const updated = updateRepairRequest(id, body);

        if (!updated) {
            console.log(`[PATCH] Request not found: ${id}`);
            return corsResponse({ error: 'Request not found' }, 404);
        }

        return corsResponse({ success: true, request: updated });
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

        const success = deleteRepairRequest(id);
        console.log(`[DELETE] Delete result for ${id}: ${success}`);

        if (!success) {
            console.log(`[DELETE] Request not found or failed to delete: ${id}`);
            return corsResponse({ error: 'Request not found or failed to delete' }, 404);
        }

        return corsResponse({ success: true, message: 'Request deleted successfully' });
    } catch (error) {
        console.error('API error:', error);
        return corsResponse({ error: 'Failed to delete request' }, 500);
    }
}

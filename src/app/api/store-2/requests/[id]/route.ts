import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  getRepairRequest,
  updateRepairRequestStatus,
  deleteRepairRequest
} from '@/lib/data';

// Flag to control whether to use Supabase
const USE_SUPABASE = process.env.NEXT_PUBLIC_SUPABASE_URL ? true : false;

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
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

    // Try Supabase first if configured
    if (USE_SUPABASE && supabase) {
      try {
        const { data: requestItem, error } = await supabase
          .from('repair_requests')
          .select('*')
          .eq('id', id)
          .single();

        if (!error && requestItem) {
          // Transform data to match frontend expectations
          const transformedRequest = {
            id: requestItem.id,
            customer: requestItem.customer_name,
            brand: requestItem.brand,
            deviceType: requestItem.device_type,
            model: requestItem.model,
            message: requestItem.message,
            name: requestItem.customer_name,
            phone: requestItem.phone,
            email: requestItem.email,
            address: requestItem.address,
            status: requestItem.status,
            createdAt: requestItem.created_at,
          };

          return corsResponse({ request: transformedRequest });
        }
      } catch (supabaseError) {
        console.error('Supabase error:', supabaseError);
      }
    }

    // Fallback to local data
    const requestItem = getRepairRequest(id);

    if (!requestItem) {
      return corsResponse({ error: 'Request not found' }, 404);
    }

    // Transform data to match frontend expectations
    const transformedRequest = {
      id: requestItem.id,
      customer: requestItem.customer_name,
      brand: requestItem.brand,
      deviceType: requestItem.device_type,
      model: requestItem.model,
      message: requestItem.message,
      name: requestItem.customer_name,
      phone: requestItem.phone,
      email: requestItem.email,
      address: requestItem.address,
      status: requestItem.status,
      createdAt: requestItem.created_at,
    };

    return corsResponse({ request: transformedRequest });
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

    if (!body.status) {
      return corsResponse({ error: 'No update data provided' }, 400);
    }

    // Try Supabase first if configured
    if (USE_SUPABASE && supabase) {
      try {
        const { data: updated, error } = await supabase
          .from('repair_requests')
          .update({ status: body.status })
          .eq('id', id)
          .select()
          .single();

        if (!error && updated) {
          // Transform response to match frontend expectations
          const transformedRequest = {
            id: updated.id,
            customer: updated.customer_name,
            brand: updated.brand,
            deviceType: updated.device_type,
            model: updated.model,
            message: updated.message,
            name: updated.customer_name,
            phone: updated.phone,
            email: updated.email,
            address: updated.address,
            status: updated.status,
            createdAt: updated.created_at,
          };

          return corsResponse({ success: true, request: transformedRequest });
        }
      } catch (supabaseError) {
        console.error('Supabase error:', supabaseError);
      }
    }

    // Fallback to local data
    const updated = updateRepairRequestStatus(id, body.status);

    if (!updated) {
      return corsResponse({ error: 'Request not found' }, 404);
    }

    // Transform response to match frontend expectations
    const transformedRequest = {
      id: updated.id,
      customer: updated.customer_name,
      brand: updated.brand,
      deviceType: updated.device_type,
      model: updated.model,
      message: updated.message,
      name: updated.customer_name,
      phone: updated.phone,
      email: updated.email,
      address: updated.address,
      status: updated.status,
      createdAt: updated.created_at,
    };

    return corsResponse({ success: true, request: transformedRequest });
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
    console.log('DELETE request for ID:', id);

    // Try Supabase first if configured
    if (USE_SUPABASE && supabase) {
      try {
        console.log('Deleting from Supabase...');
        const { error } = await supabase
          .from('repair_requests')
          .delete()
          .eq('id', id);

        if (!error) {
          console.log('Successfully deleted from Supabase:', id);
          return corsResponse({ success: true, message: `Request ${id} deleted from database` });
        } else {
          console.error('Supabase delete error:', error);
        }
      } catch (supabaseError) {
        console.error('Supabase error:', supabaseError);
      }
    }

    // Fallback to local data
    console.log('Deleting from local data...');
    const deleted = deleteRepairRequest(id);

    if (!deleted) {
      return corsResponse({ error: 'Request not found' }, 404);
    }

    return corsResponse({ success: true, message: `Request ${id} deleted` });
  } catch (error) {
    console.error('API error:', error);
    return corsResponse({ error: 'Failed to delete request' }, 500);
  }
}

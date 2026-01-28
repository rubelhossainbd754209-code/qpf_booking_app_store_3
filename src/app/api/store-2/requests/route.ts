import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  getRepairRequests,
  createRepairRequest,
  deleteRepairRequest
} from '@/lib/data';
import { LARAVEL_API_URL, LARAVEL_API_KEY, STORE_ID, STORE_NAME, STORE_CODE } from '@/lib/api-config';

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
    // Debug: Log Supabase configuration status
    console.log('=== GET Request Debug ===');
    console.log('isSupabaseConfigured():', isSupabaseConfigured());
    console.log('supabase client exists:', !!supabase);
    console.log('SUPABASE_URL env:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET');
    console.log('SUPABASE_ANON_KEY env:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');

    // Try Supabase first if configured
    if (isSupabaseConfigured() && supabase) {
      try {
        console.log('Attempting to fetch from Supabase...');
        const { data: requests, error } = await supabase
          .from('repair_requests')
          .select('*')
          .order('created_at', { ascending: false });

        console.log('Supabase fetch result - data count:', requests?.length ?? 'null', 'error:', error?.message ?? 'none');


        if (!error && requests) {
          // Transform data to match frontend expectations
          const transformedRequests = requests.map((request: any, index: number) => ({
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
        } else {
          console.error('Supabase GET error:', error);
        }
      } catch (supabaseError) {
        console.error('Supabase connection error:', supabaseError);
      }
    }

    // Fallback to local data
    const requests = getRepairRequests();

    // Transform data to match frontend expectations
    const transformedRequests = requests.map((request, index) => ({
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
    console.log('Received booking data:', body);

    // Prepare data for Supabase (only include columns that exist in the table)
    const supabaseData = {
      customer_name: body.name,
      phone: body.phone,
      email: body.email || null,
      brand: body.brand,
      device_type: body.deviceType,
      model: body.model,
      message: body.message || null,
      status: 'New',
      // Note: address, store_id, store_code removed - columns don't exist in Supabase table
    };

    let savedRequest = null;
    let supabaseSuccess = false;

    // Debug: Log Supabase configuration status for POST
    console.log('=== POST Request Debug ===');
    console.log('isSupabaseConfigured():', isSupabaseConfigured());
    console.log('supabase client exists:', !!supabase);
    console.log('SUPABASE_URL env:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET');
    console.log('SUPABASE_ANON_KEY env:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');

    // Save to Supabase if configured
    if (isSupabaseConfigured() && supabase) {
      try {
        console.log('Saving to Supabase with data:', JSON.stringify(supabaseData));

        const { data, error } = await supabase
          .from('repair_requests')
          .insert([supabaseData])
          .select()
          .single();

        console.log('Supabase INSERT result - data:', data ? 'received' : 'null', 'error:', error?.message ?? 'none', 'error code:', error?.code ?? 'none');

        if (!error && data) {
          supabaseSuccess = true;
          savedRequest = data;
          console.log('Successfully saved to Supabase:', data);
        } else {
          console.error('Supabase INSERT error details:', JSON.stringify(error));
        }
      } catch (supabaseError) {
        console.error('Supabase connection error:', supabaseError);
      }
    } else {
      console.log('Supabase NOT configured - skipping save');
    }

    // Transform data for Laravel API with Store identification
    const laravelData = {
      // Store identification - for multi-store detection
      store_id: STORE_ID,
      store_name: STORE_NAME,
      store_code: STORE_CODE,

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
    if (FORWARD_TO_LARAVEL && LARAVEL_API_URL) {
      try {
        console.log('Forwarding booking to Laravel API:', `${LARAVEL_API_URL}/bookings`);

        const response = await fetch(`${LARAVEL_API_URL}/bookings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-API-Key': LARAVEL_API_KEY,
          },
          body: JSON.stringify(laravelData),
        });

        laravelResponse = await response.json().catch(() => null);
        laravelSuccess = response.ok;

        if (!laravelSuccess) {
          console.error('Laravel API error:', laravelResponse);
        } else {
          console.log('Successfully forwarded to Laravel:', laravelResponse);
        }
      } catch (laravelError) {
        console.error('Failed to forward to Laravel API:', laravelError);
        // Continue with local storage as fallback
      }
    }

    // If Supabase didn't save, use local storage as fallback
    if (!supabaseSuccess) {
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
      savedRequest = newRequest;
    }

    // Transform response to match frontend expectations
    const transformedRequest = {
      id: savedRequest?.id || 'temp-' + Date.now(),
      customer: savedRequest?.customer_name || body.name,
      brand: savedRequest?.brand || body.brand,
      deviceType: savedRequest?.device_type || body.deviceType,
      model: savedRequest?.model || body.model,
      message: savedRequest?.message || body.message,
      name: savedRequest?.customer_name || body.name,
      phone: savedRequest?.phone || body.phone,
      email: savedRequest?.email || body.email,
      address: savedRequest?.address || body.address,
      status: savedRequest?.status || 'New',
      createdAt: savedRequest?.created_at || new Date().toISOString(),
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

// DELETE - Bulk delete multiple requests
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No IDs provided for deletion' }, { status: 400 });
    }

    console.log('Bulk DELETE request for IDs:', ids);

    let deletedCount = 0;
    let failedIds: string[] = [];

    // Delete from Supabase if configured
    if (isSupabaseConfigured() && supabase) {
      try {
        console.log('Bulk deleting from Supabase...');
        const { error } = await supabase
          .from('repair_requests')
          .delete()
          .in('id', ids);

        if (!error) {
          deletedCount = ids.length;
          console.log('Successfully bulk deleted from Supabase:', ids);
        } else {
          console.error('Supabase bulk delete error:', error);
          failedIds = ids;
        }
      } catch (supabaseError) {
        console.error('Supabase error:', supabaseError);
        failedIds = ids;
      }
    } else {
      // Fallback to local data - delete each one
      for (const id of ids) {
        const deleted = deleteRepairRequest(id);
        if (deleted) {
          deletedCount++;
        } else {
          failedIds.push(id);
        }
      }
    }

    return corsResponse({
      success: true,
      deletedCount,
      failedIds,
      message: `Successfully deleted ${deletedCount} request(s)${failedIds.length > 0 ? `, ${failedIds.length} failed` : ''}`
    });
  } catch (error) {
    console.error('API error:', error);
    return corsResponse({ error: 'Failed to delete requests' }, 500);
  }
}

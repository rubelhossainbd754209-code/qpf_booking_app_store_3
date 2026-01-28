import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Laravel Integration API for Repair Requests
 * 
 * This API provides endpoints specifically designed for Laravel platform integration
 * Returns data in a format optimized for Laravel consumption
 */

// API Key validation (you can set this in environment variables)
const LARAVEL_API_KEY = process.env.LARAVEL_API_KEY || 'qpx-laravel-integration-2024';

function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('X-API-Key') || request.headers.get('Authorization')?.replace('Bearer ', '');
  return apiKey === LARAVEL_API_KEY;
}

/**
 * GET /api/laravel/requests
 * 
 * Fetch all repair requests for Laravel integration
 * 
 * Headers:
 * - X-API-Key: Your API key for authentication
 * 
 * Query Parameters:
 * - status: Filter by status (New, In Progress, Completed, On Hold)
 * - limit: Number of records to return (default: 100)
 * - offset: Number of records to skip (default: 0)
 * - from_date: Filter requests from this date (YYYY-MM-DD)
 * - to_date: Filter requests to this date (YYYY-MM-DD)
 */
export async function GET(request: NextRequest) {
  try {
    // Validate API key
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized. Please provide a valid API key in X-API-Key header.' 
        }, 
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const fromDate = searchParams.get('from_date');
    const toDate = searchParams.get('to_date');

    // Build query
    let query = supabase
      .from('repair_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (fromDate) {
      query = query.gte('created_at', fromDate);
    }

    if (toDate) {
      query = query.lte('created_at', toDate + 'T23:59:59.999Z');
    }

    const { data: requests, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch requests' 
        }, 
        { status: 500 }
      );
    }

    // Transform data for Laravel consumption
    const laravelFormattedRequests = requests?.map(request => ({
      // Primary identifiers
      id: request.id,
      request_id: request.id,
      
      // Customer information
      customer_name: request.customer_name,
      customer_phone: request.phone,
      customer_email: request.email,
      customer_address: request.address,
      
      // Device information
      device_brand: request.brand,
      device_type: request.device_type,
      device_model: request.model,
      
      // Request details
      issue_description: request.message,
      status: request.status,
      
      // Timestamps
      created_at: request.created_at,
      updated_at: request.updated_at || request.created_at,
      
      // Additional Laravel-friendly fields
      is_new: request.status === 'New',
      is_in_progress: request.status === 'In Progress',
      is_completed: request.status === 'Completed',
      is_on_hold: request.status === 'On Hold',
      
      // Formatted display fields
      customer_display: request.customer_name,
      device_display: `${request.brand} ${request.device_type} - ${request.model}`,
      status_display: request.status,
      created_date: new Date(request.created_at).toISOString().split('T')[0],
      created_time: new Date(request.created_at).toLocaleTimeString(),
    })) || [];

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('repair_requests')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      data: laravelFormattedRequests,
      meta: {
        total: totalCount || 0,
        count: laravelFormattedRequests.length,
        limit: limit,
        offset: offset,
        has_more: (offset + limit) < (totalCount || 0)
      },
      filters_applied: {
        status: status || null,
        from_date: fromDate || null,
        to_date: toDate || null
      }
    });

  } catch (error) {
    console.error('Laravel API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      }, 
      { status: 500 }
    );
  }
}

/**
 * POST /api/laravel/requests
 * 
 * Create a new repair request from Laravel platform
 * 
 * Headers:
 * - X-API-Key: Your API key for authentication
 * - Content-Type: application/json
 * 
 * Body:
 * {
 *   "customer_name": "John Doe",
 *   "customer_phone": "+1234567890",
 *   "customer_email": "john@example.com",
 *   "customer_address": "123 Main St",
 *   "device_brand": "Apple",
 *   "device_type": "iPhone",
 *   "device_model": "iPhone 14 Pro",
 *   "issue_description": "Screen is cracked",
 *   "status": "New"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Validate API key
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized. Please provide a valid API key in X-API-Key header.' 
        }, 
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    const requiredFields = ['customer_name', 'customer_phone', 'device_brand', 'device_type', 'device_model'];
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        }, 
        { status: 400 }
      );
    }

    // Transform Laravel data to our database format
    const requestData = {
      customer_name: body.customer_name,
      phone: body.customer_phone,
      email: body.customer_email || null,
      address: body.customer_address || null,
      brand: body.device_brand,
      device_type: body.device_type,
      model: body.device_model,
      message: body.issue_description || null,
      status: body.status || 'New'
    };

    const { data, error } = await supabase
      .from('repair_requests')
      .insert([requestData])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to create request' 
        }, 
        { status: 500 }
      );
    }

    // Return Laravel-formatted response
    const laravelFormattedRequest = {
      id: data.id,
      request_id: data.id,
      customer_name: data.customer_name,
      customer_phone: data.phone,
      customer_email: data.email,
      customer_address: data.address,
      device_brand: data.brand,
      device_type: data.device_type,
      device_model: data.model,
      issue_description: data.message,
      status: data.status,
      created_at: data.created_at,
      updated_at: data.created_at,
    };

    return NextResponse.json({
      success: true,
      message: 'Request created successfully',
      data: laravelFormattedRequest
    });

  } catch (error) {
    console.error('Laravel API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      }, 
      { status: 500 }
    );
  }
}

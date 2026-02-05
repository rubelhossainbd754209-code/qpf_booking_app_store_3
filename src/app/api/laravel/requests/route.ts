import { NextRequest, NextResponse } from 'next/server';
import { getRepairRequests, createRepairRequest } from '@/lib/data';
import { getLaravelApiKey } from '@/lib/api-config';

/**
 * Laravel Integration API for Repair Requests
 * 
 * This API provides endpoints specifically designed for Laravel platform integration
 * Returns data in a format optimized for Laravel consumption
 */

function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('X-API-Key') || request.headers.get('Authorization')?.replace('Bearer ', '');
  return apiKey === getLaravelApiKey();
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

    // Fetch from local data
    const allRequests = getRepairRequests();

    // Filter by status if provided
    let filteredRequests = allRequests;
    if (status) {
      filteredRequests = filteredRequests.filter(r => r.status === status);
    }

    // Filter by dates
    if (fromDate) {
      const from = new Date(fromDate).getTime();
      filteredRequests = filteredRequests.filter(r => new Date(r.created_at).getTime() >= from);
    }

    if (toDate) {
      const to = new Date(toDate + 'T23:59:59.999Z').getTime();
      filteredRequests = filteredRequests.filter(r => new Date(r.created_at).getTime() <= to);
    }

    // Apply pagination
    const requests = filteredRequests.slice(offset, offset + limit);
    const totalCount = filteredRequests.length;

    // Transform data for Laravel consumption
    const laravelFormattedRequests = requests.map(request => ({
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
      updated_at: request.created_at,

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
    }));

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

    // Save to local data
    const newRequest = createRepairRequest({
      name: body.customer_name,
      phone: body.customer_phone,
      email: body.customer_email,
      address: body.customer_address,
      brand: body.device_brand,
      deviceType: body.device_type,
      model: body.device_model,
      message: body.issue_description
    });

    // Return Laravel-formatted response
    const laravelFormattedRequest = {
      id: newRequest.id,
      request_id: newRequest.id,
      customer_name: newRequest.customer_name,
      customer_phone: newRequest.phone,
      customer_email: newRequest.email,
      customer_address: newRequest.address,
      device_brand: newRequest.brand,
      device_type: newRequest.device_type,
      device_model: newRequest.model,
      issue_description: newRequest.message,
      status: newRequest.status,
      created_at: newRequest.created_at,
      updated_at: newRequest.created_at,
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

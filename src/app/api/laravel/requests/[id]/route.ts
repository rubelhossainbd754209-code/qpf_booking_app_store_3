import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Laravel Integration API for Individual Repair Request
 * 
 * This API provides endpoints for managing individual repair requests
 * specifically designed for Laravel platform integration
 */

// API Key validation
const LARAVEL_API_KEY = process.env.LARAVEL_API_KEY || 'qpx-laravel-integration-2024';

function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('X-API-Key') || request.headers.get('Authorization')?.replace('Bearer ', '');
  return apiKey === LARAVEL_API_KEY;
}

/**
 * GET /api/laravel/requests/[id]
 * 
 * Fetch a specific repair request by ID
 * 
 * Headers:
 * - X-API-Key: Your API key for authentication
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { data: requestItem, error } = await supabase
      .from('repair_requests')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !requestItem) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Request not found' 
        }, 
        { status: 404 }
      );
    }

    // Transform data for Laravel consumption
    const laravelFormattedRequest = {
      // Primary identifiers
      id: requestItem.id,
      request_id: requestItem.id,
      
      // Customer information
      customer_name: requestItem.customer_name,
      customer_phone: requestItem.phone,
      customer_email: requestItem.email,
      customer_address: requestItem.address,
      
      // Device information
      device_brand: requestItem.brand,
      device_type: requestItem.device_type,
      device_model: requestItem.model,
      
      // Request details
      issue_description: requestItem.message,
      status: requestItem.status,
      
      // Timestamps
      created_at: requestItem.created_at,
      updated_at: requestItem.updated_at || requestItem.created_at,
      
      // Additional Laravel-friendly fields
      is_new: requestItem.status === 'New',
      is_in_progress: requestItem.status === 'In Progress',
      is_completed: requestItem.status === 'Completed',
      is_on_hold: requestItem.status === 'On Hold',
      
      // Formatted display fields
      customer_display: requestItem.customer_name,
      device_display: `${requestItem.brand} ${requestItem.device_type} - ${requestItem.model}`,
      status_display: requestItem.status,
      created_date: new Date(requestItem.created_at).toISOString().split('T')[0],
      created_time: new Date(requestItem.created_at).toLocaleTimeString(),
    };

    return NextResponse.json({
      success: true,
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

/**
 * PUT /api/laravel/requests/[id]
 * 
 * Update a specific repair request
 * 
 * Headers:
 * - X-API-Key: Your API key for authentication
 * - Content-Type: application/json
 * 
 * Body:
 * {
 *   "status": "In Progress",
 *   "customer_name": "John Doe Updated",
 *   "customer_phone": "+1234567890",
 *   "customer_email": "john.updated@example.com",
 *   "customer_address": "456 New St",
 *   "device_brand": "Apple",
 *   "device_type": "iPhone",
 *   "device_model": "iPhone 14 Pro Max",
 *   "issue_description": "Screen and battery replacement"
 * }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Transform Laravel data to our database format
    const updateData: any = {};
    if (body.status) updateData.status = body.status;
    if (body.customer_name) updateData.customer_name = body.customer_name;
    if (body.customer_phone) updateData.phone = body.customer_phone;
    if (body.customer_email !== undefined) updateData.email = body.customer_email;
    if (body.customer_address !== undefined) updateData.address = body.customer_address;
    if (body.device_brand) updateData.brand = body.device_brand;
    if (body.device_type) updateData.device_type = body.device_type;
    if (body.device_model) updateData.model = body.device_model;
    if (body.issue_description !== undefined) updateData.message = body.issue_description;

    // Add updated timestamp
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('repair_requests')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to update request' 
        }, 
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Request not found' 
        }, 
        { status: 404 }
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
      updated_at: data.updated_at,
    };

    return NextResponse.json({
      success: true,
      message: 'Request updated successfully',
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

/**
 * DELETE /api/laravel/requests/[id]
 * 
 * Delete a specific repair request
 * 
 * Headers:
 * - X-API-Key: Your API key for authentication
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { error } = await supabase
      .from('repair_requests')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to delete request' 
        }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Request deleted successfully'
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

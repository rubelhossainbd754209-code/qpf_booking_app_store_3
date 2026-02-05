import { NextRequest, NextResponse } from 'next/server';
import { getRepairRequest, updateRepairRequest, deleteRepairRequest } from '@/lib/data';
import { getLaravelApiKey } from '@/lib/api-config';

/**
 * Laravel Integration API for Individual Repair Request
 * 
 * This API provides endpoints for managing individual repair requests
 * specifically designed for Laravel platform integration
 */

function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('X-API-Key') || request.headers.get('Authorization')?.replace('Bearer ', '');
  return apiKey === getLaravelApiKey();
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

    const requestItem = getRepairRequest(params.id);

    if (!requestItem) {
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
      updated_at: requestItem.created_at,

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

    // Update local data
    const updatedRequest = updateRepairRequest(params.id, {
      status: body.status,
      customer_name: body.customer_name,
      phone: body.customer_phone,
      email: body.customer_email,
      address: body.customer_address,
      brand: body.device_brand,
      device_type: body.device_type,
      model: body.device_model,
      message: body.issue_description
    });

    if (!updatedRequest) {
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
      id: updatedRequest.id,
      request_id: updatedRequest.id,
      customer_name: updatedRequest.customer_name,
      customer_phone: updatedRequest.phone,
      customer_email: updatedRequest.email,
      customer_address: updatedRequest.address,
      device_brand: updatedRequest.brand,
      device_type: updatedRequest.device_type,
      device_model: updatedRequest.model,
      issue_description: updatedRequest.message,
      status: updatedRequest.status,
      created_at: updatedRequest.created_at,
      updated_at: updatedRequest.created_at,
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

    const success = deleteRepairRequest(params.id);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to delete request or request not found'
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

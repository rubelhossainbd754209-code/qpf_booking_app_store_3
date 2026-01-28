import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  getFormOptions,
  addBrand,
  addDeviceType,
  addModel,
  removeBrand,
  removeDeviceType,
  removeModel
} from '@/lib/data';

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
    const formOptions = getFormOptions();
    return corsResponse({ formOptions });
  } catch (error) {
    console.error('API error:', error);
    return corsResponse({ error: 'Failed to fetch form options' }, 500);
  }
}

export async function POST(request: NextRequest) {
  // Check authentication for POST requests
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    return corsResponse({ error: 'Unauthorized' }, 401);
  }

  try {
    const body = await request.json();
    const { type, data } = body;
    let formOptions;

    switch (type) {
      case 'addBrand':
        formOptions = addBrand(data.brand);
        break;

      case 'addDeviceType':
        formOptions = addDeviceType(data.brand, data.deviceType);
        break;

      case 'addModel':
        formOptions = addModel(data.brand, data.deviceType, data.model);
        break;

      default:
        return corsResponse({ error: 'Invalid operation type' }, 400);
    }

    return corsResponse({ success: true, formOptions });
  } catch (error) {
    console.error('API error:', error);
    return corsResponse({ error: 'Failed to update form options' }, 500);
  }
}

export async function DELETE(request: NextRequest) {
  // Check authentication for DELETE requests
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    return corsResponse({ error: 'Unauthorized' }, 401);
  }

  try {
    const body = await request.json();
    const { type, data } = body;
    let formOptions;

    switch (type) {
      case 'removeBrand':
        formOptions = removeBrand(data.brand);
        break;

      case 'removeDeviceType':
        formOptions = removeDeviceType(data.brand, data.deviceType);
        break;

      case 'removeModel':
        formOptions = removeModel(data.brand, data.deviceType, data.model);
        break;

      default:
        return corsResponse({ error: 'Invalid operation type' }, 400);
    }

    return corsResponse({ success: true, formOptions });
  } catch (error) {
    console.error('API error:', error);
    return corsResponse({ error: 'Failed to delete form option' }, 500);
  }
}

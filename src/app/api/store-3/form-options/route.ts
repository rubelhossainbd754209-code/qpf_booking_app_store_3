import { NextRequest, NextResponse } from 'next/server';
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
    const formOptions = getFormOptions();
    return corsResponse({ formOptions });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, data } = body;

        let updatedOptions;

        switch (type) {
            case 'addBrand':
                updatedOptions = addBrand(data.brand);
                break;
            case 'addDeviceType':
                updatedOptions = addDeviceType(data.brand, data.deviceType);
                break;
            case 'addModel':
                updatedOptions = addModel(data.brand, data.deviceType, data.model);
                break;
            default:
                return NextResponse.json({ error: 'Invalid operation type' }, { status: 400 });
        }

        return corsResponse({ formOptions: updatedOptions });
    } catch (error) {
        return corsResponse({ error: 'Failed to process request' }, 500);
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, data } = body;

        let updatedOptions;

        switch (type) {
            case 'removeBrand':
                updatedOptions = removeBrand(data.brand);
                break;
            case 'removeDeviceType':
                updatedOptions = removeDeviceType(data.brand, data.deviceType);
                break;
            case 'removeModel':
                updatedOptions = removeModel(data.brand, data.deviceType, data.model);
                break;
            default:
                return corsResponse({ error: 'Invalid operation type' }, 400);
        }

        return corsResponse({ formOptions: updatedOptions });
    } catch (error) {
        return corsResponse({ error: 'Failed to process request' }, 500);
    }
}

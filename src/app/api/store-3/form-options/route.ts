import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAppSettings } from '@/lib/settings';

// Get Supabase client dynamically
async function getSupabaseClient() {
    const settings = await getAppSettings();
    return createClient(settings.supabaseUrl, settings.supabaseAnonKey);
}

// CORS headers for cross-origin requests
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key, Accept',
    'Access-Control-Max-Age': '86400',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
};

// Helper function to add CORS headers to response
function corsResponse(data: any, status: number = 200) {
    return NextResponse.json(data, { status, headers: corsHeaders });
}

// Handle OPTIONS preflight request
export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// Helper: Get formatted form options from Supabase
async function getFormOptionsFromDB() {
    const supabase = await getSupabaseClient();
    const { data: options, error } = await supabase
        .from('form_options')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        console.error('Error fetching form options:', error);
        return { brands: [], deviceTypes: {}, models: {} };
    }

    // Transform flat data to structured format
    const brands: string[] = [];
    const deviceTypes: { [key: string]: string[] } = {};
    const models: { [key: string]: string[] } = {};

    (options || []).forEach((opt: any) => {
        if (opt.type === 'brand') {
            if (!brands.includes(opt.value)) {
                brands.push(opt.value);
            }
        } else if (opt.type === 'device_type' && opt.brand) {
            if (!deviceTypes[opt.brand]) {
                deviceTypes[opt.brand] = [];
            }
            if (!deviceTypes[opt.brand].includes(opt.value)) {
                deviceTypes[opt.brand].push(opt.value);
            }
        } else if (opt.type === 'model' && opt.brand && opt.device_type) {
            const key = `${opt.brand}-${opt.device_type}`;
            if (!models[key]) {
                models[key] = [];
            }
            if (!models[key].includes(opt.value)) {
                models[key].push(opt.value);
            }
        }
    });

    return { brands, deviceTypes, models };
}

export async function GET() {
    try {
        const formOptions = await getFormOptionsFromDB();
        return corsResponse({ formOptions });
    } catch (error) {
        console.error('GET form-options error:', error);
        return corsResponse({ error: 'Failed to fetch form options' }, 500);
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, data } = body;
        const supabase = await getSupabaseClient();

        switch (type) {
            case 'addBrand': {
                const { error } = await supabase
                    .from('form_options')
                    .insert({ type: 'brand', value: data.brand });
                if (error) throw error;
                break;
            }
            case 'addDeviceType': {
                const { error } = await supabase
                    .from('form_options')
                    .insert({ type: 'device_type', value: data.deviceType, brand: data.brand });
                if (error) throw error;
                break;
            }
            case 'addModel': {
                const { error } = await supabase
                    .from('form_options')
                    .insert({
                        type: 'model',
                        value: data.model,
                        brand: data.brand,
                        device_type: data.deviceType
                    });
                if (error) throw error;
                break;
            }
            default:
                return corsResponse({ error: 'Invalid operation type' }, 400);
        }

        const formOptions = await getFormOptionsFromDB();
        return corsResponse({ formOptions });
    } catch (error) {
        console.error('POST form-options error:', error);
        return corsResponse({ error: 'Failed to add form option' }, 500);
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, data } = body;
        const supabase = await getSupabaseClient();

        switch (type) {
            case 'removeBrand': {
                // Delete brand and all its device types and models
                await supabase
                    .from('form_options')
                    .delete()
                    .eq('type', 'brand')
                    .eq('value', data.brand);
                await supabase
                    .from('form_options')
                    .delete()
                    .eq('brand', data.brand);
                break;
            }
            case 'removeDeviceType': {
                // Delete device type and its models
                await supabase
                    .from('form_options')
                    .delete()
                    .eq('type', 'device_type')
                    .eq('value', data.deviceType)
                    .eq('brand', data.brand);
                await supabase
                    .from('form_options')
                    .delete()
                    .eq('type', 'model')
                    .eq('brand', data.brand)
                    .eq('device_type', data.deviceType);
                break;
            }
            case 'removeModel': {
                await supabase
                    .from('form_options')
                    .delete()
                    .eq('type', 'model')
                    .eq('value', data.model)
                    .eq('brand', data.brand)
                    .eq('device_type', data.deviceType);
                break;
            }
            default:
                return corsResponse({ error: 'Invalid operation type' }, 400);
        }

        const formOptions = await getFormOptionsFromDB();
        return corsResponse({ formOptions });
    } catch (error) {
        console.error('DELETE form-options error:', error);
        return corsResponse({ error: 'Failed to remove form option' }, 500);
    }
}

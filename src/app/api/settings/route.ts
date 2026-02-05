import { NextRequest, NextResponse } from 'next/server';
import { getAppSettings, saveAppSettings } from '@/lib/settings';

// Handle GET - Retrieve current settings
export async function GET() {
    try {
        const settings = getAppSettings();
        return NextResponse.json({ success: true, settings });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to retrieve settings' }, { status: 500 });
    }
}

// Handle POST - Update settings
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate that we got some settings
        if (!body || Object.keys(body).length === 0) {
            return NextResponse.json({ success: false, error: 'No settings provided' }, { status: 400 });
        }

        const updatedSettings = saveAppSettings(body);

        return NextResponse.json({
            success: true,
            message: 'Settings updated successfully',
            settings: updatedSettings
        });
    } catch (error) {
        console.error('Settings update error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update settings'
        }, { status: 500 });
    }
}

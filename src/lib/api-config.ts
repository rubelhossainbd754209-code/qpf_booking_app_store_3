// API Configuration for Laravel Integration
// These values can be overridden via environment variables for different deployments

// ============ STORE IDENTIFICATION ============
// Change these values when copying for different stores
export const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID || 'store-3';
export const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || 'Quick Phone Fix N More - Germantown';
export const STORE_CODE = process.env.NEXT_PUBLIC_STORE_CODE || 'QPF-S3';

// ============ LARAVEL API CONFIGURATION ============
// Laravel Backend API URL - Set this in Netlify environment variables
export const LARAVEL_API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://localhost:8000/api';

// Laravel API Key for authentication
export const LARAVEL_API_KEY = process.env.NEXT_PUBLIC_LARAVEL_API_KEY || 'qpx-laravel-integration-2024';

// API Endpoints
export const API_ENDPOINTS = {
    // Booking endpoint - where the form data will be sent
    BOOKINGS: `${LARAVEL_API_URL}/bookings`,

    // Alternative endpoints if needed
    REPAIR_REQUESTS: `${LARAVEL_API_URL}/repair-requests`,

    // Stats endpoint
    STATS: `${LARAVEL_API_URL}/stats`,
};

// Helper function to make API calls to Laravel
export async function callLaravelAPI(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
) {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-API-Key': LARAVEL_API_KEY,
    };

    const config: RequestInit = {
        method,
        headers,
    };

    if (data && (method === 'POST' || method === 'PUT')) {
        config.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(endpoint, config);
        const result = await response.json();

        return {
            success: response.ok,
            status: response.status,
            data: result,
        };
    } catch (error) {
        console.error('Laravel API call failed:', error);
        return {
            success: false,
            status: 500,
            data: null,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// Submit booking to Laravel
export async function submitBookingToLaravel(bookingData: {
    name: string;
    phone: string;
    email: string;
    address?: string;
    brand: string;
    deviceType: string;
    model: string;
    message?: string;
}) {
    // Transform data to Laravel expected format
    const laravelData = {
        customer_name: bookingData.name,
        customer_phone: bookingData.phone,
        customer_email: bookingData.email,
        customer_address: bookingData.address || null,
        device_brand: bookingData.brand,
        device_type: bookingData.deviceType,
        device_model: bookingData.model,
        issue_description: bookingData.message || null,
        status: 'New',
        source: 'booking_form', // Identify the source
        submitted_at: new Date().toISOString(),
    };

    return callLaravelAPI(API_ENDPOINTS.BOOKINGS, 'POST', laravelData);
}

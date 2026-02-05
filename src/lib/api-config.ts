import { getAppSettings } from './settings';

// ============ DYNAMIC CONFIGURATION ============
// These values are fetched dynamically from the settings persistence layer

export const getDynamicSettings = () => getAppSettings();

// ============ STORE IDENTIFICATION ============
export const getStoreId = () => getAppSettings().storeId;
export const getStoreName = () => getAppSettings().storeName;
export const getStoreCode = () => getAppSettings().storeCode;

// Compatibility constants (legacy)
export const STORE_ID = getStoreId();
export const STORE_NAME = getStoreName();
export const STORE_CODE = getStoreCode();

// ============ LARAVEL API CONFIGURATION ============
export const getLaravelApiUrl = () => getAppSettings().laravelApiUrl;
export const getLaravelApiKey = () => getAppSettings().laravelApiKey;

// Legacy constants
export const LARAVEL_API_URL = getLaravelApiUrl();
export const LARAVEL_API_KEY = getLaravelApiKey();

// API Endpoints - Made dynamic
export const getApiEndpoints = () => {
    const settings = getAppSettings();
    const baseUrl = settings.laravelApiUrl || 'http://localhost:8000/api';
    return {
        BOOKINGS: `${baseUrl}/bookings`,
        REPAIR_REQUESTS: `${baseUrl}/repair-requests`,
        STATS: `${baseUrl}/stats`,
    };
};

// Legacy object support
export const API_ENDPOINTS = getApiEndpoints();

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

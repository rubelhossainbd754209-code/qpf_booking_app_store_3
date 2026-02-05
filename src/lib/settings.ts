import fs from 'fs';
import path from 'path';

// Current App Data Path - Using the current project directory for persistence
const SETTINGS_FILE_PATH = path.join(process.cwd(), 'app_settings.json');

export interface AppSettings {
    supabaseUrl: string;
    supabaseAnonKey: string;
    laravelApiUrl: string;
    laravelApiKey: string;
    storeId: string;
    storeName: string;
    storeCode: string;
}

// Default settings from environment variables
const defaultSettings: AppSettings = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    laravelApiUrl: process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://localhost:8000/api',
    laravelApiKey: process.env.NEXT_PUBLIC_LARAVEL_API_KEY || 'qpx-laravel-integration-2024',
    storeId: process.env.NEXT_PUBLIC_STORE_ID || 'store-3',
    storeName: process.env.NEXT_PUBLIC_STORE_NAME || 'Quick Phone Fix N More - Germantown',
    storeCode: process.env.NEXT_PUBLIC_STORE_CODE || 'QPF-S3',
};

// Initialize settings file if it doesn't exist
function initSettingsFile() {
    if (!fs.existsSync(SETTINGS_FILE_PATH)) {
        try {
            fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(defaultSettings, null, 2));
            console.log('✅ Settings file initialized at:', SETTINGS_FILE_PATH);
        } catch (error) {
            console.error('❌ Failed to initialize settings file:', error);
        }
    }
}

// Get all settings
export function getAppSettings(): AppSettings {
    initSettingsFile();
    try {
        const data = fs.readFileSync(SETTINGS_FILE_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('❌ Failed to read settings file, returning defaults:', error);
        return defaultSettings;
    }
}

// Save settings
export function saveAppSettings(settings: Partial<AppSettings>): AppSettings {
    const currentSettings = getAppSettings();
    const updatedSettings = { ...currentSettings, ...settings };

    try {
        fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(updatedSettings, null, 2));
        console.log('✅ Settings saved successfully');
        return updatedSettings;
    } catch (error) {
        console.error('❌ Failed to save settings file:', error);
        throw new Error('Failed to save settings');
    }
}

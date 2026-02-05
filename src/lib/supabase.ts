import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { getAppSettings } from './settings'

/**
 * Get the current Supabase client based on dynamic settings
 */
export const getSupabaseClient = (): SupabaseClient | null => {
  const settings = getAppSettings();
  if (settings.supabaseUrl && settings.supabaseAnonKey) {
    return createClient(settings.supabaseUrl, settings.supabaseAnonKey);
  }
  return null;
};

// Compatibility export (legacy support)
// Note: This may not reflect real-time changes in a long-running process,
// but for most serverless functions it will be re-evaluated.
export const supabase = getSupabaseClient();

/**
 * Helper to check if Supabase is configured
 */
export const isSupabaseConfigured = () => {
  const settings = getAppSettings();
  return !!(settings.supabaseUrl && settings.supabaseAnonKey);
};

// Types for our database tables
export interface RepairRequest {
  id?: string
  customer_name: string
  phone: string
  email?: string
  address?: string
  brand: string
  device_type: string
  model: string
  message?: string
  status: 'New' | 'In Progress' | 'Completed' | 'On Hold'
  created_at?: string
}

export interface FormOption {
  id?: string
  type: 'brand' | 'device_type' | 'model'
  value: string
  parent_id?: string
  brand?: string
  device_type?: string
  created_at?: string
}

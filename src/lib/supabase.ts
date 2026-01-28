import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Debug: Log Supabase configuration
console.log('=== Supabase Configuration ===');
console.log('SUPABASE_URL:', supabaseUrl ? supabaseUrl.substring(0, 50) + '...' : 'NOT SET');
console.log('SUPABASE_ANON_KEY:', supabaseAnonKey ? 'SET (hidden)' : 'NOT SET');
console.log('==============================');

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return supabase !== null;
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

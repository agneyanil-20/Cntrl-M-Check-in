import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Check if variables are missing or contain placeholders
  const isMissing = !url || !key;
  const isPlaceholder = url === 'YOUR_SUPABASE_URL' || key === 'YOUR_SUPABASE_ANON_KEY';
  const isInvalidUrl = !isMissing && !isPlaceholder && !url.startsWith('http');

  if (isMissing || isPlaceholder || isInvalidUrl) {
    if (isInvalidUrl) {
      console.warn('VITE_SUPABASE_URL is not a valid URL. It must start with http:// or https://');
    } else {
      console.warn('Supabase configuration is missing or using placeholders. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your settings.');
    }
    return null;
  }

  try {
    // Validate URL format before attempting to create client
    new URL(url);
    supabaseInstance = createClient(url, key);
    return supabaseInstance;
  } catch (error) {
    console.error('Failed to initialize Supabase client. Please check if VITE_SUPABASE_URL is a valid URL:', error);
    return null;
  }
}

// Interface representing the Supabase schema for attendance
export interface AttendanceRow {
  id?: string;
  employee_name: string;
  department: string;
  work_mode: string;
  date: string; // YYYY-MM-DD
  check_in_time: string; // e.g. "08:42 AM"
  check_out_time: string | null; // e.g. "05:30 PM"
  check_in_timestamp: string; // ISO String
  check_out_timestamp: string | null; // ISO String
  total_working_hours: number | null; // e.g. 8.25
  device_info: string;
  ip_address: string;
  ssid: string;
  gateway_ip: string;
  note?: string;
}

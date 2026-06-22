import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  let url = import.meta.env.VITE_SUPABASE_URL;
  let key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Cleanup helper: trim whitespace and remove potential surrounding quotes
  const clean = (val: any) => {
    if (typeof val !== 'string') return '';
    const trimmed = val.trim();
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
      return trimmed.slice(1, -1).trim();
    }
    return trimmed;
  };

  url = clean(url);
  key = clean(key);

  const isMissing = !url || !key;
  const isPlaceholder = url === 'YOUR_SUPABASE_URL' || key === 'YOUR_SUPABASE_ANON_KEY' || url === 'MY_SUPABASE_URL';
  const isInvalidUrl = !isMissing && !isPlaceholder && !url.startsWith('http');

  if (isMissing || isPlaceholder || isInvalidUrl) {
    if (isMissing) {
      console.warn('Supabase: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing from environment.');
    } else if (isPlaceholder) {
      console.warn(`Supabase: Placeholder detected for ${url === 'YOUR_SUPABASE_URL' ? 'URL' : 'Key'}. Please update your settings.`);
    } else if (isInvalidUrl) {
      console.warn('Supabase: VITE_SUPABASE_URL is invalid (must start with http:// or https://). Current value starts with:', url.slice(0, 5));
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

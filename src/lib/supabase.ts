import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const url = (import.meta as any).env?.VITE_SUPABASE_URL;
  const key = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.warn('VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are missing. Falling back to offline client mode with local database storage.');
    return null;
  }

  try {
    supabaseInstance = createClient(url, key);
    return supabaseInstance;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
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

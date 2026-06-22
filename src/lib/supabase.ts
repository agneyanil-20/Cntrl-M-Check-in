import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  // Hardcoded for testing as requested
  const hardcodedUrl = 'https://xakwkvsdqkcarxfrltzh.supabase.co';
  const url = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('YOUR_') 
    ? import.meta.env.VITE_SUPABASE_URL 
    : hardcodedUrl;
  
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key || key.includes('YOUR_')) {
    console.warn('Supabase: Missing key or using placeholders.');
    // In test mode, we might want to return null but the auth component should handle it
    return null;
  }

  try {
    supabaseInstance = createClient(url.trim(), key.trim());
    return supabaseInstance;
  } catch (error) {
    console.error('Supabase Init Error:', error);
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

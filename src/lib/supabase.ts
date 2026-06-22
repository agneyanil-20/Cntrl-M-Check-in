import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;
let lastInitError: string | null = null;

export const getSupabaseConfig = () => {
  const url = import.meta.env.VITE_SUPABASE_URL || '';
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  const hardcodedUrl = 'https://xakwkvsdqkcarxfrltzh.supabase.co';
  const activeUrl = url && !url.includes('YOUR_') ? url : hardcodedUrl;
  
  return {
    url: activeUrl,
    envUrl: url,
    hasKey: !!key && !key.includes('YOUR_'),
    isHardcoded: !url || url.includes('YOUR_'),
    lastError: lastInitError
  };
};

export function getSupabase(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const config = getSupabaseConfig();
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!config.url || !config.hasKey) {
    lastInitError = 'Configuration Incomplete: URL or Anon Key is missing or using placeholder values.';
    return null;
  }

  try {
    supabaseInstance = createClient(config.url.trim(), key!.trim());
    lastInitError = null;
    return supabaseInstance;
  } catch (error: any) {
    lastInitError = error?.message || String(error);
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

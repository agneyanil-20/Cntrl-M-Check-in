import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  console.log('--- Supabase Diagnostic Start ---');
  console.log('VITE_SUPABASE_URL:', url);
  console.log('VITE_SUPABASE_ANON_KEY:', key ? `Detected (${key.length} chars)` : 'Missing');

  const hardcodedUrl = 'https://xakwkvsdqkcarxfrltzh.supabase.co';
  const activeUrl = url && !url.includes('YOUR_') ? url : hardcodedUrl;

  if (!activeUrl || !key || key.includes('YOUR_')) {
    console.warn('Supabase: Configuration is incomplete. Missing URL or Key.');
    return null;
  }

  try {
    console.log('Attempting createClient with URL:', activeUrl);
    supabaseInstance = createClient(activeUrl.trim(), key.trim());
    console.log('Supabase client created successfully.');
    console.log('--- Supabase Diagnostic End ---');
    return supabaseInstance;
  } catch (error) {
    console.error('CRITICAL: Supabase createClient failed!');
    console.error('Error Details:', error);
    console.log('--- Supabase Diagnostic End ---');
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

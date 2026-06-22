import { SupabaseClient } from '@supabase/supabase-js';
import { getSupabase } from './supabase';
import { Database } from '../types/database';

export const dbService = {
  get client(): SupabaseClient<Database> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase client not initialized');
    return supabase as SupabaseClient<Database>;
  },

  // Auth
  async signInWithGoogle() {
    return await this.client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
  },

  async signOut() {
    return await this.client.auth.signOut();
  },

  // Employees
  async getEmployeeProfile(email: string) {
    const { data, error } = await this.client
      .from('employees')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createEmployeeProfile(profile: Database['public']['Tables']['employees']['Insert']) {
    const { data, error } = await this.client
      .from('employees')
      .insert(profile)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Attendance
  async getTodayAttendance(employeeId: string) {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await this.client
      .from('attendance')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('work_date', today)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async checkIn(employeeId: string) {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();
    
    const { data, error } = await this.client
      .from('attendance')
      .insert({
        employee_id: employeeId,
        work_date: today,
        check_in: now,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async checkOut(attendanceId: string, checkInTime: string) {
    const now = new Date();
    const checkOutTime = now.toISOString();
    const checkInDate = new Date(checkInTime);
    
    // Calculate total minutes
    const diffMs = now.getTime() - checkInDate.getTime();
    const totalMinutes = Math.floor(diffMs / 60000);

    const { data, error } = await this.client
      .from('attendance')
      .update({
        check_out: checkOutTime,
        total_minutes: totalMinutes,
      })
      .eq('id', attendanceId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAttendanceStats(employeeId: string) {
    // Basic stats for now
    const { data, error } = await this.client
      .from('attendance')
      .select('*')
      .eq('employee_id', employeeId)
      .order('work_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Expenses
  async uploadExpenseScreenshot(file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `screenshots/${fileName}`;

    const { error: uploadError } = await this.client.storage
      .from('expenses')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = this.client.storage.from('expenses').getPublicUrl(filePath);
    return data.publicUrl;
  },

  async createExpense(expense: Database['public']['Tables']['expenses']['Insert']) {
    const { data, error } = await this.client
      .from('expenses')
      .insert(expense)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getExpenseHistory(employeeId: string) {
    const { data, error } = await this.client
      .from('expenses')
      .select('*')
      .eq('employee_id', employeeId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Admin section
  async getAllEmployees() {
    const { data, error } = await this.client.from('employees').select('*');
    if (error) throw error;
    return data;
  },

  async getAllAttendance() {
    const { data, error } = await this.client
      .from('attendance')
      .select(`*, employees(full_name, email)`)
      .order('work_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getAllExpenses() {
    const { data, error } = await this.client
      .from('expenses')
      .select(`*, employees(full_name, email)`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async updateExpenseStatus(expenseId: string, status: Database['public']['Tables']['expenses']['Row']['status']) {
    const { data, error } = await this.client
      .from('expenses')
      .update({ status })
      .eq('id', expenseId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

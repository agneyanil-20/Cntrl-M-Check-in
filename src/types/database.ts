export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      employees: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'employee' | 'admin'
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          role?: 'employee' | 'admin'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'employee' | 'admin'
          created_at?: string
        }
      }
      attendance: {
        Row: {
          id: string
          employee_id: string
          work_date: string
          check_in: string | null
          check_out: string | null
          total_minutes: number | null
          created_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          work_date: string
          check_in?: string | null
          check_out?: string | null
          total_minutes?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          work_date?: string
          check_in?: string | null
          check_out?: string | null
          total_minutes?: number | null
          created_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          employee_id: string
          category: string
          amount: number
          payment_mode: string
          purpose: string
          screenshot_url: string | null
          expense_date: string
          expense_time: string
          merchant_name: string
          status: 'pending' | 'approved' | 'rejected' | 'refunded'
          created_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          category: string
          amount: number
          payment_mode: string
          purpose: string
          screenshot_url?: string | null
          expense_date: string
          expense_time: string
          merchant_name: string
          status?: 'pending' | 'approved' | 'rejected' | 'refunded'
          created_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          category?: string
          amount?: number
          payment_mode?: string
          purpose?: string
          screenshot_url?: string | null
          expense_date?: string
          expense_time?: string
          merchant_name?: string
          status?: 'pending' | 'approved' | 'rejected' | 'refunded'
          created_at?: string
        }
      }
    }
  }
}

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Clock, 
  Receipt, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { dbService } from '../lib/database.service';
import { Database } from '../types/database';

type AttendanceRecord = Database['public']['Tables']['attendance']['Row'];
type ExpenseRecord = Database['public']['Tables']['expenses']['Row'];
type EmployeeProfile = Database['public']['Tables']['employees']['Row'];

interface DashboardProps {
  employeeProfile: EmployeeProfile;
  todayAttendance: AttendanceRecord | null;
  onNavigate: (page: string) => void;
}

export default function Dashboard({ employeeProfile, todayAttendance, onNavigate }: DashboardProps) {
  const [recentExpenses, setRecentExpenses] = useState<ExpenseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const expenses = await dbService.getExpenseHistory(employeeProfile.id);
        setRecentExpenses(expenses.slice(0, 3));
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [employeeProfile.id]);

  const calculateHours = (minutes: number | null) => {
    if (!minutes) return '0h 0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'rejected': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'refunded': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Attendance Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-black text-white rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Clock className="w-24 h-24" />
          </div>
          <h2 className="text-sm font-retro font-black uppercase tracking-[0.2em] text-[#EAFF00] mb-2 font-black">Attendance Status</h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-retro uppercase text-gray-400 font-bold">Current Status</p>
              <div className="flex items-center gap-2 mt-1">
                {todayAttendance?.check_in && !todayAttendance.check_out ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-[#EAFF00] animate-pulse" />
                    <span className="text-2xl font-retro font-black uppercase">On Duty</span>
                  </>
                ) : todayAttendance?.check_out ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-gray-500" />
                    <span className="text-2xl font-retro font-black uppercase">Off Duty</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="text-2xl font-retro font-black uppercase">Not Clocked In</span>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8 pb-2 border-t border-white/10 pt-4">
              <div>
                <p className="text-[10px] font-retro uppercase text-gray-400 font-bold">Check In</p>
                <p className="text-lg font-mono font-black">{todayAttendance?.check_in ? new Date(todayAttendance.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</p>
              </div>
              <div>
                <p className="text-[10px] font-retro uppercase text-gray-400 font-bold">Hours Today</p>
                <p className="text-lg font-mono font-black">{calculateHours(todayAttendance?.total_minutes || 0)}</p>
              </div>
            </div>
          </div>
          <button 
            onClick={() => onNavigate('attendance')}
            className="mt-6 w-full py-3 bg-[#EAFF00] text-black rounded-2xl font-retro font-black uppercase text-xs flex items-center justify-center gap-2"
          >
            Manage Attendance <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Stats Card */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-retro font-black uppercase tracking-widest text-gray-900 leading-none">Activity Glance</h2>
              <TrendingUp className="w-5 h-5 text-[#EAFF00]" />
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100">
                  <Calendar className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <p className="text-[10px] font-retro font-black uppercase text-gray-400">Week 24</p>
                  <p className="text-sm font-bold text-gray-900">32.5 Total Hours</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100">
                  <Receipt className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <p className="text-[10px] font-retro font-black uppercase text-gray-400 text-black">Pending Expenses</p>
                  <p className="text-sm font-bold text-gray-900">${recentExpenses.filter(e => e.status === 'pending').reduce((acc, curr) => acc + Number(curr.amount), 0).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-50 flex gap-2">
            <span className="px-3 py-1 bg-gray-100 rounded-full text-[9px] font-black uppercase text-gray-500 tracking-tighter">System ID: {employeeProfile.id.slice(0, 8)}</span>
            <span className="px-3 py-1 bg-[#EAFF00]/10 rounded-full text-[9px] font-black uppercase text-[#EAFF00] tracking-tighter brightness-75">Level: {employeeProfile.role}</span>
          </div>
        </div>
      </div>

      {/* Recent Expenses List */}
      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-retro font-black uppercase tracking-widest text-gray-900 leading-none">Recent Expenses</h2>
          <button 
            onClick={() => onNavigate('expenses')}
            className="text-[10px] font-retro font-black uppercase text-gray-400 hover:text-black transition-colors"
          >
            View All
          </button>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-300" />
            </div>
          ) : recentExpenses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-gray-400 font-bold uppercase">No recent expense activity</p>
            </div>
          ) : (
            recentExpenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 group hover:border-gray-200 transition-all cursor-pointer" onClick={() => onNavigate('expenses')}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 line-clamp-1">{expense.description}</p>
                    <p className="text-[9px] font-mono font-bold text-gray-400 uppercase">{new Date(expense.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-sm font-mono font-black text-gray-900">${Number(expense.amount).toFixed(2)}</span>
                  <span className={`text-[8px] font-retro font-black uppercase px-2 py-0.5 rounded-full border ${getStatusColor(expense.status)}`}>
                    {expense.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function RefreshCw(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}

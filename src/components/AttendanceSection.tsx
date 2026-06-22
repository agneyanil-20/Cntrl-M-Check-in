import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  Calendar, 
  History, 
  TrendingUp, 
  ChevronRight,
  Timer,
  CalendarCheck,
  CalendarDays
} from 'lucide-react';
import { SlideAction } from './SlideAction';
import { dbService } from '../lib/database.service';
import { Database } from '../types/database';

type AttendanceRecord = Database['public']['Tables']['attendance']['Row'];
type EmployeeProfile = Database['public']['Tables']['employees']['Row'];

interface AttendanceSectionProps {
  employeeProfile: EmployeeProfile;
  todayAttendance: AttendanceRecord | null;
  isCheckedIn: boolean;
  checkInTimeFormatted: string | null;
  officeNetworkConnected: boolean;
  onCheckIn: () => Promise<void>;
  onCheckOut: () => Promise<void>;
}

export default function AttendanceSection({
  employeeProfile,
  todayAttendance,
  isCheckedIn,
  checkInTimeFormatted,
  officeNetworkConnected,
  onCheckIn,
  onCheckOut
}: AttendanceSectionProps) {
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ weekly: 0, monthly: 0 });

  useEffect(() => {
    async function loadHistory() {
      try {
        const records = await dbService.getAttendanceStats(employeeProfile.id);
        setHistory(records);
        
        // Calculate stats
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const weekMinutes = records
          .filter(r => new Date(r.work_date) >= startOfWeek)
          .reduce((acc, curr) => acc + (curr.total_minutes || 0), 0);
          
        const monthMinutes = records
          .filter(r => new Date(r.work_date) >= startOfMonth)
          .reduce((acc, curr) => acc + (curr.total_minutes || 0), 0);
          
        setStats({
          weekly: Math.round(weekMinutes / 60),
          monthly: Math.round(monthMinutes / 60)
        });
      } catch (error) {
        console.error('Failed to load history:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadHistory();
  }, [employeeProfile.id, todayAttendance]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Network Status Header */}
      <div className="flex flex-col items-center justify-center gap-1">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-retro font-black uppercase tracking-wider border transition-all ${
          officeNetworkConnected ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
        }`}>
          <span>{officeNetworkConnected ? '🟢 Office Network Verified' : '🔴 Office Network Not Detected'}</span>
        </div>
        {!officeNetworkConnected && (
          <p className="text-[10px] text-rose-600 font-bold uppercase tracking-tight text-center">
            Reconnect to office network to continue attendance.
          </p>
        )}
      </div>

      {/* Main Punch Card */}
      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-retro font-black uppercase text-gray-900 tracking-widest leading-none">Terminal State</h2>
            <p className="text-[10px] font-mono font-bold text-gray-400 uppercase mt-1">Shift Verification</p>
          </div>
          {isCheckedIn && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 text-[10px] font-mono font-bold uppercase">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active since {checkInTimeFormatted}
            </div>
          )}
        </div>

        <SlideAction 
          isCheckedIn={isCheckedIn} 
          onAction={isCheckedIn ? onCheckOut : onCheckIn} 
          disabled={!officeNetworkConnected} 
        />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
            <CalendarCheck className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-[10px] font-retro font-black uppercase text-gray-400">Weekly Hours</p>
          <p className="text-2xl font-mono font-black mt-1 text-gray-900">{stats.weekly}h</p>
        </div>
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
          <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center mb-4">
            <CalendarDays className="w-4 h-4 text-orange-500" />
          </div>
          <p className="text-[10px] font-retro font-black uppercase text-gray-400">Monthly Hours</p>
          <p className="text-2xl font-mono font-black mt-1 text-gray-900">{stats.monthly}h</p>
        </div>
      </div>

      {/* History Section */}
      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-gray-900">
            <History className="w-5 h-5" />
            <h2 className="text-sm font-retro font-black uppercase tracking-widest leading-none">Duty Ledger</h2>
          </div>
          <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">{history.length} Logs</p>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-gray-100 border-t-black rounded-full animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
              <p className="text-xs text-gray-400 font-bold uppercase">No records found in local ledger</p>
            </div>
          ) : (
            history.map((record) => (
              <div key={record.id} className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">{new Date(record.work_date).toLocaleDateString()}</p>
                    <p className="text-[9px] font-mono font-bold text-gray-400 uppercase">
                      {record.check_in ? new Date(record.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'} 
                      {' → '} 
                      {record.check_out ? new Date(record.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono font-black text-gray-900">
                    {record.total_minutes ? `${Math.floor(record.total_minutes / 60)}h ${record.total_minutes % 60}m` : '--'}
                  </p>
                  <p className="text-[8px] font-retro font-black uppercase text-gray-400">Total Duty</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

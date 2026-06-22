import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Database, 
  Lock, 
  Server,
  AlertTriangle,
  RefreshCw,
  Clock
} from 'lucide-react';
import { dbService } from '../lib/database.service';
import { getSupabase } from '../lib/supabase';

export default function HealthCheck() {
  const [status, setStatus] = useState<{
    connected: boolean | 'loading';
    auth: boolean | 'loading';
    tables: {
      employees: boolean | 'loading' | 'missing';
      attendance: boolean | 'loading' | 'missing';
      expenses: boolean | 'loading' | 'missing';
    };
    errors: string[];
    lastChecked: string | null;
  }>({
    connected: 'loading',
    auth: 'loading',
    tables: {
      employees: 'loading',
      attendance: 'loading',
      expenses: 'loading'
    },
    errors: [],
    lastChecked: null
  });

  const checkConnectivity = async () => {
    setStatus(prev => ({ ...prev, connected: 'loading', auth: 'loading', tables: { employees: 'loading', attendance: 'loading', expenses: 'loading' }, errors: [] }));
    
    const errors: string[] = [];
    let isConnected = false;
    let isAuthAvailable = false;

    const supabase = getSupabase();
    if (!supabase) {
      setStatus(prev => ({ 
        ...prev, 
        connected: false, 
        auth: false, 
        tables: { employees: 'missing', attendance: 'missing', expenses: 'missing' },
        errors: ['Supabase client failed to initialize. Check environment variables.']
      }));
      return;
    }

    isConnected = true;
    
    try {
      const { data: authData, error: authError } = await supabase.auth.getSession();
      if (!authError) isAuthAvailable = true;
    } catch (e) {
      errors.push('Auth Check Failed: ' + (e as Error).message);
    }

    const tableResults = {
      employees: false as boolean | 'missing',
      attendance: false as boolean | 'missing',
      expenses: false as boolean | 'missing'
    };

    // Check Employees
    try {
      const { error } = await supabase.from('employees').select('count');
      if (error) throw error;
      tableResults.employees = true;
    } catch (e: any) {
      errors.push('Employees Table: ' + e.message);
      if (e.message?.includes('does not exist')) tableResults.employees = 'missing';
    }

    // Check Attendance
    try {
      const { error } = await supabase.from('attendance').select('count');
      if (error) throw error;
      tableResults.attendance = true;
    } catch (e: any) {
      errors.push('Attendance Table: ' + e.message);
      if (e.message?.includes('does not exist')) tableResults.attendance = 'missing';
    }

    // Check Expenses
    try {
      const { error } = await supabase.from('expenses').select('count');
      if (error) throw error;
      tableResults.expenses = true;
    } catch (e: any) {
      errors.push('Expenses Table: ' + e.message);
      if (e.message?.includes('does not exist')) tableResults.expenses = 'missing';
    }

    setStatus({
      connected: isConnected,
      auth: isAuthAvailable,
      tables: {
        employees: tableResults.employees as any,
        attendance: tableResults.attendance as any,
        expenses: tableResults.expenses as any
      },
      errors,
      lastChecked: new Date().toLocaleTimeString()
    });
  };

  useEffect(() => {
    checkConnectivity();
  }, []);

  const StatusIcon = ({ state }: { state: boolean | 'loading' | 'missing' }) => {
    if (state === 'loading') return <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" />;
    if (state === 'missing' || state === false) return <XCircle className="w-4 h-4 text-rose-500" />;
    return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EAFF00] flex items-center justify-center shadow-sm">
            <Activity className="w-6 h-6 text-black" />
          </div>
          <div>
            <h2 className="text-sm font-retro font-black uppercase tracking-tight text-gray-900 leading-none">System Diagnostics</h2>
            <p className="text-[9px] font-mono font-bold text-gray-400 uppercase mt-1">Supabase Health Check</p>
          </div>
        </div>
        <button 
          onClick={checkConnectivity}
          className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-400"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-gray-400" />
            <span className="text-[10px] font-retro font-black uppercase text-gray-600">Connected</span>
          </div>
          <StatusIcon state={status.connected} />
        </div>
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-gray-400" />
            <span className="text-[10px] font-retro font-black uppercase text-gray-600">Auth Engine</span>
          </div>
          <StatusIcon state={status.auth} />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-[10px] font-retro font-black uppercase text-gray-400 tracking-widest pl-1 mb-2">Database Schema</h3>
        {Object.entries(status.tables).map(([name, state]) => (
          <div key={name} className="flex items-center justify-between py-2 px-4 bg-white border border-gray-50 rounded-xl">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-gray-300" />
              <span className="text-xs font-bold text-gray-700 capitalize">{name}</span>
            </div>
            <StatusIcon state={state as any} />
          </div>
        ))}
      </div>

      {status.errors.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-[10px] font-retro font-black uppercase">Incident Logs</span>
          </div>
          <ul className="space-y-1">
            {status.errors.map((err, i) => (
              <li key={i} className="text-[9px] font-mono text-rose-700 leading-tight border-l-2 border-rose-200 pl-2">
                {err}
              </li>
            ))}
          </ul>
        </div>
      )}

      {status.lastChecked && (
        <div className="flex items-center justify-center gap-2 text-[8px] font-mono font-bold text-gray-300 uppercase tracking-widest">
          <Clock className="w-3 h-3" />
          <span>Last Verified: {status.lastChecked}</span>
        </div>
      )}
    </div>
  );
}

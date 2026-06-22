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
  Clock,
  Terminal,
  ShieldCheck
} from 'lucide-react';
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
    setStatus(prev => ({ 
      ...prev, 
      connected: 'loading', 
      auth: 'loading', 
      tables: { employees: 'loading', attendance: 'loading', expenses: 'loading' }, 
      errors: [] 
    }));
    
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
        errors: ['Supabase client failed to initialize. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.']
      }));
      return;
    }

    try {
      // Test 1: Handshake
      const { error: handshakeError } = await supabase.from('employees').select('id').limit(1);
      isConnected = !handshakeError || handshakeError.code !== 'PGRST301'; // PGRST301 is JWT error, which still means endpoint is reachable
      
      // Test 2: Auth
      const { error: authError } = await supabase.auth.getSession();
      isAuthAvailable = !authError;
      if (authError) errors.push('Auth: ' + authError.message);

      // Test 3: Tables
      const tableCheck = async (table: 'employees' | 'attendance' | 'expenses') => {
        const { error } = await supabase.from(table).select('id').limit(1);
        if (error) {
          if (error.code === '42P01') {
            errors.push(`${table} table is missing from database.`);
            return 'missing';
          }
          // Some errors are expected if user is not logged in (RLS), but the table exists
          if (error.message.includes('permission denied')) return true; 
          errors.push(`${table}: ${error.message}`);
          return false;
        }
        return true;
      };

      const [employees, attendance, expenses] = await Promise.all([
        tableCheck('employees'),
        tableCheck('attendance'),
        tableCheck('expenses')
      ]);

      setStatus({
        connected: isConnected,
        auth: isAuthAvailable,
        tables: {
          employees: employees as any,
          attendance: attendance as any,
          expenses: expenses as any
        },
        errors,
        lastChecked: new Date().toLocaleTimeString()
      });
    } catch (e: any) {
      errors.push('CRITICAL: ' + e.message);
      setStatus(prev => ({ ...prev, connected: false, auth: false, errors }));
    }
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col items-center justify-center gap-1 text-center mb-8">
        <div className="w-16 h-16 bg-black text-[#EAFF00] rounded-3xl flex items-center justify-center shadow-2xl mb-4 border border-[#EAFF00]/20 transform -rotate-3">
          <Terminal className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-retro font-black uppercase tracking-tight text-gray-900">Sentinel Diag</h2>
        <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">Connection Protocol Verification</p>
      </div>

      <div className="grid gap-4">
        {/* Core Connections */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3">
            <div className={`p-3 rounded-2xl ${status.connected === true ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400'}`}>
              <Server className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="text-[10px] font-retro font-black uppercase text-gray-900 leading-none">Supabase</p>
              <p className={`text-[9px] font-bold mt-1 uppercase ${status.connected === true ? 'text-emerald-500' : 'text-gray-400'}`}>
                {status.connected === 'loading' ? 'Checking...' : status.connected ? 'Connected' : 'Disconnected'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3">
            <div className={`p-3 rounded-2xl ${status.auth === true ? 'bg-[#EAFF00]/10 text-black' : 'bg-gray-50 text-gray-400'}`}>
              <Lock className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="text-[10px] font-retro font-black uppercase text-gray-900 leading-none">Auth System</p>
              <p className={`text-[9px] font-bold mt-1 uppercase ${status.auth === true ? 'text-black' : 'text-gray-400'}`}>
                {status.auth === 'loading' ? 'Verifying...' : status.auth ? 'Available' : 'Restricted'}
              </p>
            </div>
          </div>
        </div>

        {/* Database Tables */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <Database className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="text-xs font-retro font-black uppercase text-gray-900 leading-none">Tables Available</h3>
                <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">Schema Synchronization</p>
              </div>
            </div>
            <button 
              onClick={checkConnectivity}
              className="p-2 hover:bg-gray-50 rounded-xl border border-gray-100 text-gray-400 transition-all hover:text-black"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {Object.entries(status.tables).map(([name, state]) => (
              <div key={name} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${state === true ? 'bg-emerald-400' : state === 'loading' ? 'bg-gray-300 animate-pulse' : 'bg-rose-400'}`} />
                  <span className="text-xs font-mono font-bold text-gray-700 capitalize">{name}</span>
                </div>
                <div className={`px-2 py-0.5 rounded-full text-[8px] font-retro font-black uppercase border ${state === true ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                  {state === 'loading' ? 'PENDING' : state === true ? 'READY' : 'OFFLINE'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error Logs */}
        {status.errors.length > 0 && (
          <div className="bg-rose-50 border border-rose-100 rounded-[32px] p-6 space-y-3">
            <div className="flex items-center gap-2 text-rose-600 mb-1">
              <AlertTriangle className="w-4 h-4" />
              <p className="text-[10px] font-retro font-black uppercase tracking-widest">Error Trace Detected</p>
            </div>
            <div className="space-y-2">
              {status.errors.map((err, i) => (
                <div key={i} className="p-3 bg-white/50 rounded-xl border border-rose-100">
                  <p className="text-[10px] font-mono font-bold text-rose-700 break-all leading-tight">
                    {err}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Success Indicator */}
        {status.connected === true && status.auth === true && !Object.values(status.tables).includes(false) && (
          <div className="bg-emerald-500 text-white rounded-[32px] p-6 flex items-center justify-between shadow-xl shadow-emerald-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-retro font-black uppercase leading-none">All Systems GO</p>
                <p className="text-[9px] font-bold opacity-80 uppercase mt-1.5">Secure connection established</p>
              </div>
            </div>
            <CheckCircle2 className="w-8 h-8 opacity-40 shrink-0" />
          </div>
        )}

        {status.lastChecked && (
          <div className="flex items-center justify-center gap-2 text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest py-4">
            <Clock className="w-3.5 h-3.5" />
            <span>Cycle Verified: {status.lastChecked}</span>
          </div>
        )}
      </div>
    </div>
  );
}

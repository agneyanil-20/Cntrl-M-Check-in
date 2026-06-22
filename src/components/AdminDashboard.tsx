import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Clock, 
  Receipt, 
  BarChart3, 
  CheckCircle2, 
  XCircle, 
  RefreshCcw,
  Search,
  Download,
  Calendar,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  MoreVertical,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { dbService } from '../lib/database.service';
import { Database } from '../types/database';

type Employee = Database['public']['Tables']['employees']['Row'];
type AttendanceFull = Database['public']['Tables']['attendance']['Row'] & { 
  employees: { full_name: string; email: string } | null 
};
type ExpenseFull = Database['public']['Tables']['expenses']['Row'] & { 
  employees: { full_name: string; email: string } | null 
};

export default function AdminDashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceFull[]>([]);
  const [expenses, setExpenses] = useState<ExpenseFull[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'employees' | 'attendance' | 'expenses'>('attendance');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [empData, attData, expData] = await Promise.all([
        dbService.getAllEmployees(),
        dbService.getAllAttendance(),
        dbService.getAllExpenses()
      ]);
      setEmployees(empData as Employee[]);
      setAttendance(attData as AttendanceFull[]);
      setExpenses(expData as ExpenseFull[]);
    } catch (error) {
      console.error('Admin fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExpenseAction = async (expenseId: string, status: ExpenseFull['status']) => {
    try {
      await dbService.updateExpenseStatus(expenseId, status);
      // Local update
      setExpenses(prev => prev.map(exp => exp.id === expenseId ? { ...exp, status } : exp));
    } catch (error) {
      console.error('Update status error:', error);
      alert('Action failed');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-12">
        <Loader2 className="w-12 h-12 animate-spin text-[#EAFF00]" />
        <p className="mt-4 text-xs font-retro font-black uppercase text-gray-400">Loading Sentinel Console...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-black text-white p-4 rounded-3xl border border-white/10 shadow-xl overflow-hidden relative group">
          <TrendingUp className="absolute -right-2 -bottom-2 w-16 h-16 opacity-10 group-hover:scale-110 transition-transform" />
          <h4 className="text-[10px] font-retro font-black uppercase tracking-widest text-[#EAFF00] mb-1">Live Pulse</h4>
          <div className="text-2xl font-retro font-black leading-none">{attendance.length}</div>
          <p className="text-[8px] font-mono uppercase text-gray-400 mt-1">Check-in Sessions logged</p>
        </div>
        <div className="bg-[#EAFF00] text-black p-4 rounded-3xl border border-[#EAFF00] shadow-lg overflow-hidden relative group">
          <Receipt className="absolute -right-2 -bottom-2 w-16 h-16 opacity-10 group-hover:scale-110 transition-transform" />
          <h4 className="text-[10px] font-retro font-black uppercase tracking-widest text-black/50 mb-1">Expenses</h4>
          <div className="text-2xl font-retro font-black leading-none">{expenses.filter(e => e.status === 'pending').length}</div>
          <p className="text-[8px] font-mono uppercase text-black/40 mt-1">Pending claims awaiting review</p>
        </div>
      </div>

      {/* Navigation Rails */}
      <div className="flex bg-gray-100/50 p-1 rounded-2xl border border-gray-200">
        {(['employees', 'attendance', 'expenses'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 h-10 rounded-xl text-[10px] font-retro font-black uppercase tracking-widest transition-all ${
              activeTab === tab 
                ? 'bg-white text-black shadow-sm' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main View Area */}
      <div className="space-y-4 min-h-[400px]">
        {activeTab === 'attendance' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-retro font-black uppercase text-gray-900 tracking-widest flex items-center gap-2">
                <Clock className="w-3.2 h-3.2" />
                <span>Attendance Logs</span>
              </h3>
              <button 
                onClick={fetchData}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
                title="Refresh logs"
              >
                <RefreshCcw className="w-3 h-3" />
              </button>
            </div>
            
            <div className="space-y-2">
              {attendance.map((log) => (
                <div key={log.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-xs uppercase">
                        {log.employees?.full_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="text-xs font-black text-gray-900">{log.employees?.full_name || 'Unknown'}</p>
                        <p className="text-[9px] font-mono text-gray-400">{log.employees?.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-retro font-black uppercase text-gray-400">{log.work_date}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 bg-gray-50/50 p-2.5 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-[8px] font-retro font-black uppercase text-gray-400 mb-0.5">Check In</p>
                      <p className="text-[10px] font-mono font-bold text-gray-900">
                        {log.check_in ? new Date(log.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[8px] font-retro font-black uppercase text-gray-400 mb-0.5">Check Out</p>
                      <p className="text-[10px] font-mono font-bold text-gray-900">
                        {log.check_out ? new Date(log.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}
                      </p>
                    </div>
                    {log.total_minutes !== null && (
                      <div className="col-span-2 pt-2 border-t border-gray-200/50 mt-1 flex justify-between items-center">
                        <p className="text-[8px] font-retro font-black uppercase text-gray-400">Total Duration</p>
                        <span className="text-[10px] font-mono font-bold text-emerald-600">
                          {(log.total_minutes / 60).toFixed(1)} hrs
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="space-y-4">
            <h3 className="text-xs font-retro font-black uppercase text-gray-900 tracking-widest flex items-center gap-2 px-1">
              <Receipt className="w-3.2 h-3.2" />
              <span>Expense Claims Manager</span>
            </h3>

            {expenses.map((expense) => (
              <div key={expense.id} className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[9px] font-retro font-black uppercase px-2 py-0.5 rounded-full border ${
                        expense.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                        expense.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                        expense.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                        'bg-sky-50 text-sky-600 border-sky-300'
                      }`}>
                        {expense.status}
                      </span>
                      <span className="text-[9px] font-mono text-gray-400">{expense.expense_date}</span>
                    </div>
                    <h4 className="text-sm font-black text-gray-900">{expense.merchant_name}</h4>
                    <p className="text-[10px] font-mono text-gray-500">{expense.employees?.full_name} ({expense.employees?.email})</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-retro font-black text-gray-900">₹{expense.amount}</p>
                    <p className="text-[9px] font-retro font-extrabold text-gray-400 tracking-tight">{expense.category}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 text-[11px] font-medium text-gray-600">
                  {expense.purpose}
                </div>

                {expense.screenshot_url && (
                  <div className="relative group">
                    <img 
                      src={expense.screenshot_url} 
                      alt="Receipt" 
                      className="w-full h-40 object-cover rounded-2xl border border-gray-200 cursor-zoom-in hover:opacity-90 transition-all shadow-inner" 
                    />
                    <a 
                      href={expense.screenshot_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="absolute top-2 right-2 p-2 bg-black/50 backdrop-blur-md rounded-xl text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}

                {expense.status === 'pending' && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => handleExpenseAction(expense.id, 'rejected')}
                      className="flex items-center justify-center gap-2 h-11 bg-white border border-rose-200 text-rose-600 rounded-2xl text-[10px] font-retro font-black uppercase hover:bg-rose-50 transition-all active:scale-95"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleExpenseAction(expense.id, 'approved')}
                      className="flex items-center justify-center gap-2 h-11 bg-black text-white border border-black rounded-2xl text-[10px] font-retro font-black uppercase hover:bg-gray-900 transition-all active:scale-95 shadow-lg shadow-black/20"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approve
                    </button>
                  </div>
                )}
                
                {expense.status === 'approved' && (
                  <button
                    onClick={() => handleExpenseAction(expense.id, 'refunded')}
                    className="w-full h-11 bg-emerald-600 text-white rounded-2xl text-[10px] font-retro font-black uppercase hover:bg-emerald-700 transition-all active:scale-95 shadow-md shadow-emerald-200 flex items-center justify-center gap-2"
                  >
                    <RefreshCcw className="w-3.5 h-3.5" />
                    Mark as Refunded
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'employees' && (
          <div className="space-y-4">
            <h3 className="text-xs font-retro font-black uppercase text-gray-900 tracking-widest flex items-center gap-2 px-1">
              <Users className="w-3.2 h-3.2" />
              <span>Registered Personnel</span>
            </h3>

            <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    <th className="p-4 text-[9px] font-retro font-black uppercase text-gray-400 tracking-widest">Name</th>
                    <th className="p-4 text-[9px] font-retro font-black uppercase text-gray-400 tracking-widest">Access</th>
                    <th className="p-4 text-[9px] font-retro font-black uppercase text-gray-400 tracking-widest text-right">Since</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="p-4">
                        <div className="text-xs font-black text-gray-900">{emp.full_name}</div>
                        <div className="text-[9px] font-mono text-gray-400">{emp.email}</div>
                      </td>
                      <td className="p-4">
                        <span className={`text-[8px] font-retro font-black uppercase px-2 py-0.5 rounded-full border ${emp.role === 'admin' ? 'bg-black text-[#EAFF00] border-black' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                          {emp.role}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="text-[9px] font-mono text-gray-400">{new Date(emp.created_at).toLocaleDateString()}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-gray-100 shrink-0 shadow-sm">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
        </div>
        <div>
          <p className="text-[10px] font-retro font-black uppercase text-gray-900 leading-tight">Admin Protocol Active</p>
          <p className="text-[9px] font-medium text-gray-400 mt-0.5">Transactions are being logged securely to cloud infrastructure.</p>
        </div>
      </div>
    </div>
  );
}

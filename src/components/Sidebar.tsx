import React from 'react';
import { 
  LayoutDashboard, 
  Clock, 
  Receipt, 
  ShieldCheck, 
  LogOut,
  X,
  ShieldAlert
} from 'lucide-react';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: any) => void;
  isAdmin: boolean;
  onSignOut: () => void;
  onClose?: () => void;
  employeeName: string;
}

export default function Sidebar({ 
  activePage, 
  onNavigate, 
  isAdmin, 
  onSignOut, 
  onClose,
  employeeName
}: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
  ];

  if (isAdmin) {
    navItems.push({ id: 'admin', label: 'Admin Portal', icon: ShieldCheck });
  }

  return (
    <div className="h-full flex flex-col bg-black text-white p-6">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#EAFF00] rounded-xl">
            <ShieldAlert className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-xl font-retro font-black uppercase tracking-tight">Sentry</h1>
            <p className="text-[10px] font-mono font-black uppercase text-[#EAFF00]/60 tracking-widest mt-0.5">Core System</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full md:hidden">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              onNavigate(item.id);
              onClose?.();
            }}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 group ${
              activePage === item.id 
                ? 'bg-[#EAFF00] text-black shadow-[0_4px_20px_rgba(234,255,0,0.2)]' 
                : 'hover:bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <item.icon className={`w-5 h-5 ${activePage === item.id ? 'text-black' : 'group-hover:scale-110 transition-transform'}`} />
            <span className="text-xs font-retro font-black uppercase tracking-widest leading-none">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/10">
        <div className="mb-6 px-2">
          <p className="text-[10px] font-retro font-black text-gray-500 uppercase tracking-widest mb-1">Authenticated As</p>
          <p className="text-sm font-bold truncate">{employeeName}</p>
        </div>
        <button 
          onClick={onSignOut}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-colors group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-retro font-black uppercase tracking-widest leading-none">Sign Out</span>
        </button>
      </div>
    </div>
  );
}

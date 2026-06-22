import React, { useState, useEffect } from 'react';
import { CheckInRecord, Coworker } from './types';
import ProfileSettings from './components/ProfileSettings';
import HistoryBoard from './components/HistoryBoard';
import CoworkersList from './components/CoworkersList';
import Confetti from './components/Confetti';
import EmployersSwitch, { OFFICIAL_EMPLOYERS } from './components/EmployersSwitch';
import { getSupabase } from './lib/supabase';
import { validateOfficeNetwork, verifyOfficeNetwork, verifyActualOfficeNetwork } from './lib/network';
import { SlideAction } from './components/SlideAction';
import { dbService } from './lib/database.service';
import { SupabaseAuth } from './components/SupabaseAuth';
import ExpenseManager from './components/ExpenseManager';
import AdminDashboard from './components/AdminDashboard';
import { Session, User as AuthUser } from '@supabase/supabase-js';
import { Database } from './types/database';
import { 
  ShieldAlert, 
  Settings, 
  User, 
  Clock, 
  Calendar, 
  Sparkles, 
  HelpCircle,
  TrendingUp,
  MapPin,
  Flame,
  Award,
  Users,
  Moon,
  Sun,
  Sunrise,
  Sunset,
  MessageSquare,
  Volume2,
  VolumeX,
  BadgeAlert,
  Wifi,
  WifiOff,
  CheckCircle,
  Database as DatabaseIcon,
  Receipt,
  LogOut,
  LayoutDashboard,
  Loader2,
  XCircle,
  Activity
} from 'lucide-react';
import HealthCheck from './components/HealthCheck';
import { motion, AnimatePresence } from 'motion/react';

type EmployeeProfile = Database['public']['Tables']['employees']['Row'];
type AttendanceRecord = Database['public']['Tables']['attendance']['Row'];

export default function App() {
  // Supabase Auth & Profile State
  const [session, setSession] = useState<Session | null>(null);
  const [employeeProfile, setEmployeeProfile] = useState<EmployeeProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [restrictedUser, setRestrictedUser] = useState(false);

  // Office network validation parameters
  const [networkSSID, setNetworkSSID] = useState<string>('Unknown Wi-Fi');
  const [networkGateway, setNetworkGateway] = useState<string>('Unknown Gateway');
  const [networkLocalIP, setNetworkLocalIP] = useState<string>('Unknown IP');
  const [realPublicIP, setRealPublicIP] = useState<string>('Detecting...');
  const [officeNetworkConnected, setOfficeNetworkConnected] = useState<boolean>(false);
  const [isValidatingNetwork, setIsValidatingNetwork] = useState<boolean>(true);
  const [networkMessage, setNetworkMessage] = useState<string>('Not Connected to Office Network');
  const [networkDiagnostics, setNetworkDiagnostics] = useState<string>('Initializing diagnostics scanner...');
  const [bypassAttemptShow, setBypassAttemptShow] = useState<boolean>(false);
  const [supabaseStatusMsg, setSupabaseStatusMsg] = useState<string>('Checking...');

  // Attendance State from DB
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
  const [checkInTimeFormatted, setCheckInTimeFormatted] = useState<string | null>(null);

  // UI state controls
  const [activePage, setActivePage] = useState<'punch' | 'expenses' | 'ledger' | 'admin' | 'health'>('punch');
  const [isExploding, setIsExploding] = useState(false);
  const [systemNotification, setSystemNotification] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Auth Listener
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setIsAuthLoading(false);
      return;
    }

    sb.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSession = async (session: Session | null) => {
    setSession(session);
    if (session?.user) {
      const email = session.user.email || '';
      if (email.endsWith('@cntrlm.com')) {
        setRestrictedUser(false);
        try {
          let profile = await dbService.getEmployeeProfile(email);
          if (!profile) {
            profile = await dbService.createEmployeeProfile({
              email,
              full_name: session.user.user_metadata.full_name || email.split('@')[0],
              role: 'employee',
            });
          }
          setEmployeeProfile(profile);
          fetchAttendance(profile.id);
        } catch (error) {
          console.error('Profile fetch error:', error);
        }
      } else {
        setRestrictedUser(true);
        setEmployeeProfile(null);
      }
    } else {
      setEmployeeProfile(null);
      setRestrictedUser(false);
      setTodayAttendance(null);
      setIsCheckedIn(false);
    }
    setIsAuthLoading(false);
  };

  const fetchAttendance = async (employeeId: string) => {
    try {
      const att = await dbService.getTodayAttendance(employeeId);
      setTodayAttendance(att);
      if (att) {
        setIsCheckedIn(!!att.check_in && !att.check_out);
        if (att.check_in) {
          setCheckInTimeFormatted(new Date(att.check_in).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
        }
      } else {
        setIsCheckedIn(false);
        setCheckInTimeFormatted(null);
      }
    } catch (error) {
      console.error('Attendance fetch error:', error);
    }
  };

  // Network Validation
  const runNetworkValidation = async () => {
    setIsValidatingNetwork(true);
    try {
      const res = await verifyActualOfficeNetwork();
      setNetworkSSID(res.ssid);
      setNetworkGateway(res.gatewayIp);
      setNetworkLocalIP(res.localIp);
      setOfficeNetworkConnected(res.success);
      setNetworkDiagnostics(res.diagnostics);
      setNetworkMessage(res.success ? 'Connected to Office Network' : 'Not Connected to Office Network');
    } catch (err) {
      setOfficeNetworkConnected(false);
    } finally {
      setIsValidatingNetwork(false);
    }
  };

  useEffect(() => {
    runNetworkValidation();
    const triggerValidation = () => runNetworkValidation();
    window.addEventListener('online', triggerValidation);
    window.addEventListener('offline', triggerValidation);
    window.addEventListener('focus', triggerValidation);
    document.addEventListener('visibilitychange', () => !document.hidden && triggerValidation());
    const interval = setInterval(triggerValidation, 5000);
    return () => {
      window.removeEventListener('online', triggerValidation);
      window.removeEventListener('offline', triggerValidation);
      window.removeEventListener('focus', triggerValidation);
      clearInterval(interval);
    };
  }, []);

  // Time & Greeting
  const [greeting, setGreeting] = useState({ text: 'Good Morning', icon: '🌅' });
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }));
      const hour = now.getHours();
      if (hour >= 5 && hour < 12) setGreeting({ text: 'Good Morning', icon: '🌅' });
      else if (hour >= 12 && hour < 17) setGreeting({ text: 'Good Afternoon', icon: '☀️' });
      else if (hour >= 17 && hour < 21) setGreeting({ text: 'Good Evening', icon: '🌇' });
      else setGreeting({ text: 'Good Night', icon: '🌌' });
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCheckIn = async () => {
    if (!employeeProfile || !officeNetworkConnected) return;
    try {
      const att = await dbService.checkIn(employeeProfile.id);
      setTodayAttendance(att);
      setIsCheckedIn(true);
      setCheckInTimeFormatted(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
      setIsExploding(true);
      setTimeout(() => setIsExploding(false), 5000);
      setSystemNotification(`🛡️ Greetings ${employeeProfile.full_name}! Safe entrance granted.`);
      setTimeout(() => setSystemNotification(null), 4500);
    } catch (error) {
      alert('Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    if (!employeeProfile || !todayAttendance || !officeNetworkConnected) return;
    try {
      const att = await dbService.checkOut(todayAttendance.id, todayAttendance.check_in!);
      setTodayAttendance(att);
      setIsCheckedIn(false);
      setSystemNotification(`👋 Workday completed! Farewell, ${employeeProfile.full_name}.`);
      setTimeout(() => setSystemNotification(null), 4500);
    } catch (error) {
      alert('Check-out failed');
    }
  };

  const handleSignOut = async () => {
    await dbService.signOut();
  };

  if (!employeeProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-12">
        {isAuthLoading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-black" />
            <p className="text-[10px] font-retro font-black uppercase text-gray-400">Verifying Identity...</p>
          </div>
        ) : restrictedUser ? (
          <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl border border-rose-100 text-center">
            <XCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
            <h2 className="text-xl font-retro font-black uppercase text-gray-900 mb-2">Access Denied</h2>
            <p className="text-xs text-gray-500 font-bold uppercase mb-6">Credential mismatch. Only employees with @cntrlm.com domain are authorized.</p>
            <button onClick={handleSignOut} className="w-full h-12 bg-black text-white rounded-xl font-retro font-black uppercase flex items-center justify-center gap-2">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        ) : (
          <SupabaseAuth />
        )}
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-24 bg-gray-50 text-slate-850 overflow-x-hidden">
      <header className={`sticky top-0 z-40 transition-all duration-300 backdrop-blur-md border-b-[3px] ${
        activePage === 'punch' ? 'bg-[#EAFF00]/95 border-black/90' : 'bg-white/90 border-gray-100 text-black'
      }`}>
        <div className="max-w-screen-md mx-auto px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-xl border-2 transition-colors ${
              activePage === 'punch' ? 'bg-black text-[#EAFF00] border-black' : 'bg-gray-100 text-gray-600 border-gray-200'
            }`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-retro font-black uppercase leading-none tracking-tight">Sentry</h1>
              <p className="text-[8px] font-mono font-black uppercase opacity-60 mt-0.5 tracking-[0.2em]">{employeeProfile.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {employeeProfile.role === 'admin' && (
              <button
                onClick={() => setActivePage(activePage === 'admin' ? 'punch' : 'admin')}
                className={`p-2.5 rounded-xl border transition-all ${
                  activePage === 'admin' ? 'bg-black text-white border-black' : 'bg-white border-gray-200 text-gray-400 hover:text-black'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
              </button>
            )}
            <button onClick={handleSignOut} className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-rose-500 transition-all">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-md mx-auto px-4 pt-6 space-y-6">
        {activePage === 'admin' ? (
          <AdminDashboard />
        ) : activePage === 'health' ? (
          <HealthCheck />
        ) : activePage === 'expenses' ? (
          <ExpenseManager employeeId={employeeProfile.id} />
        ) : (
          <>
            <div className="flex flex-col items-center justify-center gap-1 animate-fade-in">
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

            <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-black text-white rounded-[32px] p-8 min-h-[220px] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }} className="text-4xl opacity-20">{greeting.icon}</motion.div>
              </div>
              <h2 className="text-sm font-retro font-black uppercase tracking-[0.2em] text-[#EAFF00] mb-2">{greeting.text}</h2>
              <h3 className="text-3xl font-retro font-black uppercase leading-tight tracking-tight max-w-[240px]">{employeeProfile.full_name}</h3>
              <div className="mt-8 flex items-end justify-between">
                <div className="text-4xl font-mono font-black tracking-tighter flex items-center gap-2">
                  <Clock className="w-6 h-6 text-[#EAFF00]" />
                  <span>{timeStr.split(':').slice(0, 2).join(':')}</span>
                  <span className="text-sm opacity-50 font-retro uppercase tracking-widest">{timeStr.split(' ')[1]}</span>
                </div>
              </div>
            </motion.div>

            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex flex-col gap-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xs font-retro font-black uppercase text-gray-900 tracking-widest">Attendance Status</h3>
                {isCheckedIn && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 text-[10px] font-mono font-bold">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {checkInTimeFormatted}
                  </div>
                )}
              </div>
              <SlideAction isCheckedIn={isCheckedIn} onAction={isCheckedIn ? handleCheckOut : handleCheckIn} disabled={!officeNetworkConnected} />
            </div>
          </>
        )}
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-black/90 backdrop-blur-xl border border-white/10 rounded-full h-16 w-max px-2.5 flex items-center gap-2 shadow-2xl">
        <button onClick={() => setActivePage('punch')} className={`flex items-center gap-3 px-6 h-11 rounded-full transition-all ${
          activePage === 'punch' ? 'bg-[#EAFF00] text-black font-retro font-black text-xs uppercase' : 'text-gray-400 font-bold text-xs uppercase'
        }`}>
          <Clock className="w-5 h-5" /> {activePage === 'punch' && <span>Punch</span>}
        </button>
        <button onClick={() => setActivePage('expenses')} className={`flex items-center gap-3 px-6 h-11 rounded-full transition-all ${
          activePage === 'expenses' ? 'bg-[#EAFF00] text-black font-retro font-black text-xs uppercase' : 'text-gray-400 font-bold text-xs uppercase'
        }`}>
          <Receipt className="w-5 h-5" /> {activePage === 'expenses' && <span>Expenses</span>}
        </button>
        <button onClick={() => setActivePage('health')} className={`flex items-center gap-3 px-6 h-11 rounded-full transition-all ${
          activePage === 'health' ? 'bg-[#EAFF00] text-black font-retro font-black text-xs uppercase' : 'text-gray-400 font-bold text-xs uppercase'
        }`}>
          <Activity className="w-5 h-5" /> {activePage === 'health' && <span>Health</span>}
        </button>
      </nav>

      <AnimatePresence>
        {systemNotification && (
          <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="fixed top-0 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm px-5 py-4 bg-black text-[#EAFF00] rounded-2xl shadow-2xl border border-[#EAFF00]/20 flex items-center gap-4 text-xs font-retro font-black uppercase tracking-wide">
            <ShieldAlert className="w-5 h-5" />
            <span>{systemNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {isExploding && <Confetti active={isExploding} />}
    </div>
  );
}

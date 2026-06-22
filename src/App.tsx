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
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AttendanceSection from './components/AttendanceSection';
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
  Activity,
  Menu
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
  const [activePage, setActivePage] = useState<'dashboard' | 'attendance' | 'expenses' | 'admin' | 'health'>('dashboard');
  const [isExploding, setIsExploding] = useState(false);
  const [systemNotification, setSystemNotification] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      // Allow @cntrlm.com OR the specific developer email for testing
      const isAuthorized = email.endsWith('@cntrlm.com') || email === 'agney.0.anil.1.com@gmail.com';
      
      if (isAuthorized) {
        setRestrictedUser(false);
        try {
          let profile = await dbService.getEmployeeProfile(email);
          if (!profile) {
            profile = await dbService.createEmployeeProfile({
              email,
              full_name: session.user.user_metadata.full_name || email.split('@')[0],
              role: email === 'agney.0.anil.1.com@gmail.com' ? 'admin' : 'employee', // Auto-admin for developer
            });
          }
          setEmployeeProfile(profile);
          fetchAttendance(profile.id);
        } catch (error) {
          console.error('Profile fetch error:', error);
          setSystemNotification('System Error: Profile binding failed.');
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
      
      // Developer bypass
      if (session?.user?.email === 'agney.0.anil.1.com@gmail.com') {
        setOfficeNetworkConnected(true);
        setNetworkMessage('Developer Override: Connected');
      } else {
        setOfficeNetworkConnected(res.success);
        setNetworkMessage(res.success ? 'Connected to Office Network' : 'Not Connected to Office Network');
      }

      setNetworkSSID(res.ssid);
      setNetworkGateway(res.gatewayIp);
      setNetworkLocalIP(res.localIp);
      setNetworkDiagnostics(res.diagnostics);
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
    <div className="flex min-h-screen bg-gray-50 text-slate-900 overflow-x-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-72 sticky top-0 h-screen overflow-y-auto">
        <Sidebar 
          activePage={activePage} 
          onNavigate={setActivePage} 
          isAdmin={employeeProfile.role === 'admin'} 
          onSignOut={handleSignOut}
          employeeName={employeeProfile.full_name}
        />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50] md:hidden"
            />
            <motion.div 
              initial={{ x: -280 }} 
              animate={{ x: 0 }} 
              exit={{ x: -280 }}
              className="fixed inset-y-0 left-0 w-72 z-[51] md:hidden"
            >
              <Sidebar 
                activePage={activePage} 
                onNavigate={setActivePage} 
                isAdmin={employeeProfile.role === 'admin'} 
                onSignOut={handleSignOut}
                onClose={() => setIsSidebarOpen(false)}
                employeeName={employeeProfile.full_name}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 h-20 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl border border-gray-200 text-gray-500 hover:text-black hover:bg-gray-50 transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-retro font-black uppercase tracking-tight text-gray-900 capitalize">
              {activePage === 'dashboard' ? 'Overview' : activePage}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] font-retro font-black uppercase text-gray-400 leading-none">Local Time</span>
              <span className="text-sm font-mono font-black text-gray-900">{timeStr}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#EAFF00] border-2 border-black flex items-center justify-center font-retro font-black uppercase text-xs shadow-sm">
              {employeeProfile.full_name.charAt(0)}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-10 max-w-screen-xl mx-auto w-full">
          {activePage === 'admin' ? (
            <AdminDashboard />
          ) : activePage === 'health' ? (
            <HealthCheck />
          ) : activePage === 'attendance' ? (
            <AttendanceSection 
              employeeProfile={employeeProfile}
              todayAttendance={todayAttendance}
              isCheckedIn={isCheckedIn}
              checkInTimeFormatted={checkInTimeFormatted}
              officeNetworkConnected={officeNetworkConnected}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
            />
          ) : activePage === 'expenses' ? (
            <ExpenseManager employeeId={employeeProfile.id} />
          ) : (
            <Dashboard 
              employeeProfile={employeeProfile} 
              todayAttendance={todayAttendance}
              onNavigate={setActivePage}
            />
          )}
        </main>
      </div>

      <AnimatePresence>
        {systemNotification && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }} 
            animate={{ y: 20, opacity: 1 }} 
            exit={{ y: -50, opacity: 0 }} 
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-sm px-5 py-4 bg-black text-[#EAFF00] rounded-2xl shadow-2xl border border-[#EAFF00]/20 flex items-center gap-4 text-xs font-retro font-black uppercase tracking-wide"
          >
            <ShieldAlert className="w-5 h-5" />
            <span>{systemNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {isExploding && <Confetti active={isExploding} />}
    </div>
  );
}

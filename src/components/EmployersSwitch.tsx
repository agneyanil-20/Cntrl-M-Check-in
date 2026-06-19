import React from 'react';
import { UserProfile } from '../types';
import { Shield, Sparkles, X, UserCheck, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const OFFICIAL_EMPLOYERS: UserProfile[] = [
  {
    name: 'Agney',
    department: 'Castle Guard (Engineering) 🛡️',
    statusText: '⚔️ Defending the main application frame',
    avatarEmoji: '⚡',
    workMode: 'Office'
  },
  {
    name: 'Neha',
    department: 'Product & Design 🧭',
    statusText: '🎨 Sketching castle corridors',
    avatarEmoji: '👸',
    workMode: 'Office'
  },
  {
    name: 'Megha',
    department: 'HR & Operations 🪙',
    statusText: '📜 Auditing medieval scrolls',
    avatarEmoji: '🧙‍♀️',
    workMode: 'Hybrid'
  },
  {
    name: 'Sijin',
    department: 'Castle Guard (Engineering) 🛡️',
    statusText: '💻 Patching memory leaks in the moat',
    avatarEmoji: '🧙‍♂️',
    workMode: 'Office'
  },
  {
    name: 'Shaun',
    department: 'Castle Guard (Engineering) 🛡️',
    statusText: '🐉 Restraining development wyverns',
    avatarEmoji: '🐲',
    workMode: 'Office'
  },
  {
    name: 'Adhil',
    department: 'Castle Guard (Engineering) 🛡️',
    statusText: '🏹 Hunting rogue production compilation bugs',
    avatarEmoji: '🏹',
    workMode: 'Remote'
  },
  {
    name: 'Abhay',
    department: 'Sales & Marketing 🎺',
    statusText: '🎺 Sounding heraldic trumpet of product launches',
    avatarEmoji: '🦁',
    workMode: 'Office'
  },
  {
    name: 'Nived',
    department: 'Castle Guard (Engineering) 🛡️',
    statusText: '🍕 Fueling continuous code deployment',
    avatarEmoji: '💻',
    workMode: 'Hybrid'
  },
  {
    name: 'Hari',
    department: 'Monarch & Court (Executive) 👑',
    statusText: '👑 Overseeing the entire territory',
    avatarEmoji: '👑',
    workMode: 'Office'
  }
];

interface EmployersSwitchProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfileName: string;
  onSelect: (selected: UserProfile) => void;
  userCheckInStatuses: { [name: string]: { isCheckedIn: boolean; time: string | null } };
}

export default function EmployersSwitch({
  isOpen,
  onClose,
  currentProfileName,
  onSelect,
  userCheckInStatuses
}: EmployersSwitchProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        id="employer-switch-overlay"
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          id="employer-switch-modal"
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="bg-white text-black neo-border w-full max-w-md p-6 neo-shadow-lg rounded-2xl relative overflow-y-auto max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-5 pb-3 border-b-2 border-black/10">
            <div>
              <h2 className="text-2xl font-retro font-bold uppercase tracking-wide flex items-center gap-2">
                <UserCheck className="w-6 h-6 text-amber-500" />
                Select Employer
              </h2>
              <p className="text-[11px] font-sans text-gray-500 font-semibold mt-0.5 uppercase tracking-wide">
                Switch active duty profile instantly
              </p>
            </div>
            <button
              id="close-switch-btn"
              onClick={onClose}
              className="p-1 rounded-lg border-2 border-black hover:bg-amber-100 transition-colors bg-white hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Employer Items Grid */}
          <div className="space-y-2.5">
            {OFFICIAL_EMPLOYERS.map((emp) => {
              const isCurrent = emp.name === currentProfileName;
              const statusInfo = userCheckInStatuses[emp.name] || { isCheckedIn: false, time: null };

              return (
                <button
                  key={emp.name}
                  type="button"
                  onClick={() => {
                    onSelect(emp);
                    onClose();
                  }}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-center justify-between hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] relative ${
                    isCurrent
                      ? 'border-black bg-[#EAFF00]/10 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                      : 'border-black bg-white hover:bg-slate-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Badge */}
                    <div className="w-10 h-10 rounded-full border-2 border-black bg-[#EAFF00] flex items-center justify-center text-xl shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] relative">
                      {emp.avatarEmoji}
                      {statusInfo.isCheckedIn && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-black flex items-center justify-center text-[8px] text-white">
                          ✓
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-rounded font-extrabold text-sm text-gray-900">
                          {emp.name}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] font-retro font-bold bg-[#EAFF00] border border-black uppercase px-1 rounded text-black leading-none">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 font-sans tracking-wide">
                        {emp.department}
                      </p>
                      <p className="text-[11px] text-gray-400 italic font-medium leading-tight truncate max-w-[200px] mt-0.5">
                        &quot;{emp.statusText}&quot;
                      </p>
                    </div>
                  </div>

                  {/* Right side checkin clock indicator */}
                  <div className="text-right flex flex-col items-end">
                    {statusInfo.isCheckedIn ? (
                      <span className="text-[10px] font-retro font-bold bg-emerald-100/80 text-emerald-800 border border-emerald-300 px-1.5 py-0.5 rounded">
                        🏰 {statusInfo.time}
                      </span>
                    ) : (
                      <span className="text-[9px] font-retro text-gray-400 uppercase tracking-wider font-bold">
                        ⛺ Off-duty
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 bg-amber-50 p-2.5 rounded-xl border border-black/15 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[10px] font-sans text-amber-800 font-semibold leading-normal uppercase">
              Notice: Duty statuses are recorded on your device registry logs.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

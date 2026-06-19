import React, { useState } from 'react';
import { Coworker } from '../types';
import { Users, Send, Smile, ThumbsUp, Sword } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CoworkersListProps {
  coworkers: Coworker[];
  onInteract: (coworkerName: string, saluteType: string) => void;
}

export default function CoworkersList({ coworkers, onInteract }: CoworkersListProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'inside'>('all');
  const [saluteNotification, setSaluteNotification] = useState<string | null>(null);

  const filteredCoworkers = coworkers.filter((c) => {
    if (activeTab === 'inside') return c.isCheckedIn;
    return true;
  });

  const triggerSalute = (name: string, type: string) => {
    onInteract(name, type);
    setSaluteNotification(`Sent a ${type} to ${name}! 🦉 Sent via Carrier Pigeon.`);
    setTimeout(() => {
      setSaluteNotification(null);
    }, 3000);
  };

  return (
    <div id="coworkers-board" className="space-y-4">
      {/* Toast alert inside the card for actions */}
      <AnimatePresence>
        {saluteNotification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-black text-[#EAFF00] p-2 rounded-xl text-center text-xs font-retro font-bold uppercase tracking-wider"
          >
            {saluteNotification}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'all'
              ? 'bg-white text-black border border-gray-200 shadow-sm'
              : 'text-gray-500'
          }`}
        >
          All Recruits ({coworkers.length})
        </button>
        <button
          onClick={() => setActiveTab('inside')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'inside'
              ? 'bg-white text-black border border-gray-200 shadow-sm'
              : 'text-gray-500'
          }`}
        >
          🏰 At Fort ({coworkers.filter((c) => c.isCheckedIn).length})
        </button>
      </div>

      <div className="space-y-2.5 max-h-[220px] overflow-y-auto">
        {filteredCoworkers.map((cw) => (
          <div
            key={cw.id}
            className={`p-2.5 rounded-xl border transition-all flex items-center justify-between ${
              cw.isCheckedIn
                ? 'border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50'
                : 'border-dashed border-gray-200 bg-gray-50/50'
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Avatar with Status badge */}
              <div className="relative bg-white w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-xl shadow-xs">
                {cw.avatarEmoji}
                {cw.isCheckedIn && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-white" />
                )}
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <h4 className="text-xs font-extrabold font-rounded text-gray-900">{cw.name}</h4>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{cw.workMode || 'Away'}</span>
                </div>
                <p className="text-[10px] text-gray-500 leading-none mt-0.5">
                  {cw.department}
                </p>
                <p className="text-[11px] text-gray-600 font-medium italic mt-1 bg-white/60 px-1 rounded inline-block">
                  &quot;{cw.statusText}&quot;
                </p>
              </div>
            </div>

            {/* Actions for Coworkers */}
            <div className="flex flex-col items-end gap-1.5">
              {cw.isCheckedIn ? (
                <>
                  <span className="text-[9px] font-retro font-bold bg-[#EAFF00] px-1.5 py-0.5 border border-yellow-300 rounded text-black shrink-0">
                    🛡️ {cw.timeFormatted || '08:00 AM'}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => triggerSalute(cw.name, '🍺 Toast')}
                      className="p-1.5 rounded bg-white hover:bg-amber-50 border border-gray-200 text-xs hover:scale-110 active:scale-95 transition-all shadow-xs"
                      title="Send toast"
                    >
                      🍺
                    </button>
                    <button
                      onClick={() => triggerSalute(cw.name, '⚔️ Salute')}
                      className="p-1.5 rounded bg-white hover:bg-sky-50 border border-gray-200 text-xs hover:scale-110 active:scale-95 transition-all shadow-xs"
                      title="Salute peer"
                    >
                      ⚔️
                    </button>
                  </div>
                </>
              ) : (
                <span className="text-[9px] font-medium text-gray-400 bg-gray-100 rounded px-1.5 py-0.5 border border-gray-200">
                  ⛺ Off Duty
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

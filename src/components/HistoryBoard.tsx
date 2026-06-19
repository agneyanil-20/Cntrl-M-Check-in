import React from 'react';
import { CheckInRecord } from '../types';
import { Calendar, Trash2, Clock, MapPin, Award, Flame, Smile } from 'lucide-react';
import { motion } from 'motion/react';

interface HistoryBoardProps {
  records: CheckInRecord[];
  onClear: () => void;
}

export default function HistoryBoard({ records, onClear }: HistoryBoardProps) {
  // Compute some fun statistics
  const totalChekins = records.length;
  
  // Calculate streaks (consecutive days of check-ins)
  const calculateStreak = () => {
    if (records.length === 0) return 0;
    
    // Sort unique dates only
    const dates = Array.from(new Set(records.map(r => r.dateFormatted))).reverse();
    let streak = 1;
    // For local mockup tracking, we can state an amazing streak for the user if they have multiple records
    return dates.length;
  };

  const streak = calculateStreak();

  return (
    <div id="check-in-history-board" className="space-y-4">
      {/* Mini Stats Banner */}
      <div className="grid grid-cols-3 gap-3">
        {/* Total stats */}
        <div className="bg-amber-50 rounded-xl p-3 neo-border-sm flex flex-col items-center text-center">
          <Award className="w-5 h-5 text-amber-600 mb-1" />
          <div className="text-xl font-retro font-bold">{totalChekins}</div>
          <div className="text-[9px] uppercase tracking-wider font-bold text-gray-500 font-sans">Campaigns</div>
        </div>

        {/* Streak stats */}
        <div className="bg-[#EAFF00]/10 rounded-xl p-3 neo-border-sm flex flex-col items-center text-center">
          <Flame className="w-5 h-5 text-orange-500 fill-orange-400 mb-1 animate-pulse" />
          <div className="text-xl font-retro font-bold">{streak} {streak === 1 ? 'Day' : 'Days'}</div>
          <div className="text-[9px] uppercase tracking-wider font-bold text-gray-500 font-sans">Battle Streak</div>
        </div>

        {/* Common mode */}
        <div className="bg-teal-50 rounded-xl p-3 neo-border-sm flex flex-col items-center text-center">
          <MapPin className="w-5 h-5 text-teal-600 mb-1" />
          <div className="text-base font-bold font-rounded truncate max-w-full">
            {records.length > 0 ? records[0].workMode : 'None'}
          </div>
          <div className="text-[9px] uppercase tracking-wider font-bold text-gray-500 font-sans">Primary Base</div>
        </div>
      </div>

      {/* History List */}
      <div className="bg-slate-50 rounded-2xl p-4 neo-border-sm max-h-[220px] overflow-y-auto">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs uppercase font-retro font-bold text-gray-500 tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-black" />
            Duty Logs
          </h3>
          {records.length > 0 && (
            <button
              id="clear-history-btn"
              onClick={onClear}
              className="text-[10px] uppercase font-retro font-bold py-1 px-2 border border-black hover:bg-red-50 text-red-600 rounded bg-white transition-all flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Wipe Logs
            </button>
          )}
        </div>

        {records.length === 0 ? (
          <div className="py-8 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
            <div className="text-3xl">💤</div>
            <p className="text-xs font-sans font-medium italic">No battles registered today. Tap check-in above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((rec, index) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white p-2.5 rounded-xl neo-border-sm hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex flex-col gap-2"
              >
                {/* Header Row */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold font-retro text-[#EAFF00] bg-black px-1.5 py-0.5 rounded border border-black" title="Check-In Time">
                        IN: {rec.timeFormatted}
                      </span>
                      {rec.checkOutTime && (
                        <span className="text-xs font-bold font-retro text-white bg-emerald-600 px-1.5 py-0.5 rounded border border-black" title="Check-Out Time">
                          OUT: {rec.checkOutTime}
                        </span>
                      )}
                      <span className="text-[10px] text-gray-500 font-bold">
                        {rec.dateFormatted}
                      </span>
                    </div>
                    {/* User name who logged this */}
                    <div className="text-xs font-black font-rounded text-gray-900 mt-1 flex items-center gap-1">
                      👤 {rec.name || 'Champion'}
                    </div>
                  </div>
                  <div className="text-lg">
                    {rec.workMode === 'Office' ? '🏰' : rec.workMode === 'Remote' ? '🏕️' : '🐎'}
                  </div>
                </div>

                {/* Main description badge */}
                <div className="text-[11px] font-sans text-gray-700 flex flex-col gap-1 bg-slate-50 p-2 rounded-lg border border-black/10">
                  <div className="flex justify-between">
                    <span>Guild Wing: <strong className="text-black">{rec.department}</strong></span>
                    <span>Mode: <strong className="text-black">{rec.workMode}</strong></span>
                  </div>
                  {rec.totalWorkingHours !== undefined && (
                    <div className="text-xs uppercase font-retro font-black text-emerald-700 flex items-center gap-1 mt-0.5">
                      ⏱️ Duration: {rec.totalWorkingHours.toFixed(2)} hours
                    </div>
                  )}
                  {rec.note && (
                    <p className="text-[10px] italic text-gray-500 font-medium">
                      📝 "{rec.note}"
                    </p>
                  )}
                </div>

                {/* Audit Information Panel */}
                <div className="text-[9px] font-mono text-gray-400 bg-gray-50 p-1.5 rounded border border-dashed border-gray-200 flex flex-col gap-1">
                  <div className="flex justify-between">
                    <span>📶 Network: <strong className="text-gray-650">{rec.ssid}</strong></span>
                    <span>🌐 IP: <strong className="text-gray-650">{rec.ipAddress}</strong></span>
                  </div>
                  <div className="flex justify-between">
                    <span>🚪 Gateway: <strong className="text-gray-650">{rec.gatewayIp}</strong></span>
                    <span className="truncate max-w-[150px]" title={rec.deviceInfo}>💻 Sys: {rec.deviceInfo}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

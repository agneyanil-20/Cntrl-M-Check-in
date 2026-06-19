import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

interface NetworkStatusProps {
  isConnected: boolean;
  isCheckedIn: boolean;
}

export function NetworkStatus({ isConnected, isCheckedIn }: NetworkStatusProps) {
  return (
    <div id="reusable-network-status" className="w-full text-center space-y-2 select-none animate-fade-in">
      {/* Centered Chip Indicator */}
      <div className="flex justify-center">
        <div
          id="network-status-badge"
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold border transition-all ${
            isConnected
              ? 'bg-emerald-50 text-emerald-950 border-emerald-300 shadow-sm'
              : 'bg-rose-50 text-rose-950 border-rose-300 shadow-sm'
          }`}
        >
          <span className="flex h-2.5 w-2.5 relative">
            {isConnected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-600 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected ? 'bg-emerald-600' : 'bg-rose-650'}`}></span>
          </span>
          
          <span className="font-retro uppercase tracking-wider text-[11px] font-black">
            {isConnected ? '🟢 Connected to Office Network' : '🔴 Not Connected to Office Network'}
          </span>
        </div>
      </div>

      {/* Structured Helper text / Verification diagnostics */}
      <div className="min-h-[20px] flex items-center justify-center">
        {!isConnected ? (
          <p className="text-xs text-rose-600 font-semibold flex items-center justify-center gap-1.5 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>
              Please connect to the office WiFi to mark attendance.
            </span>
          </p>
        ) : (
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>Secure 192.168.29.0/24 subnet matched</span>
          </p>
        )}
      </div>
    </div>
  );
}

import React from 'react';
import { Wifi, AlertTriangle, ShieldCheck } from 'lucide-react';

interface NetworkStatusProps {
  isConnected: boolean;
  onToggleSimulate: () => void;
  isCheckedIn: boolean;
}

export function NetworkStatus({ isConnected, onToggleSimulate, isCheckedIn }: NetworkStatusProps) {
  return (
    <div id="reusable-network-status" className="w-full text-center space-y-2 select-none animate-fade-in">
      {/* Centered Chip Trigger Button */}
      <div className="flex justify-center">
        <button
          id="network-status-toggle-badge"
          type="button"
          onClick={onToggleSimulate}
          title="Click to toggle simulated network location"
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black border-2 border-black neo-shadow-sm cursor-pointer transition-all hover:scale-105 active:scale-95 ${
            isConnected
              ? 'bg-emerald-400 text-black'
              : 'bg-rose-100 text-rose-950 border-rose-500 hover:bg-rose-200'
          }`}
        >
          <span className="flex h-2.5 w-2.5 relative">
            {isConnected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-600 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected ? 'bg-emerald-600' : 'bg-rose-650 animate-pulse'}`}></span>
          </span>
          
          <span className="font-retro uppercase tracking-wider text-[11px] font-black">
            {isConnected ? '🟢 Connected to Office Network' : '🔴 Not Connected to Office Network'}
          </span>
          
          <span className="text-[9px] font-bold underline opacity-60 hover:opacity-100 transition-opacity">
            (Switch)
          </span>
        </button>
      </div>

      {/* Structured Helper text / Verification diagnostics */}
      <div className="min-h-[20px] flex items-center justify-center">
        {!isConnected ? (
          <p className="text-xs text-rose-600 font-semibold flex items-center justify-center gap-1.5 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>
              {isCheckedIn 
                ? 'Please connect to the office network to check out.' 
                : 'Please connect to the office network to check in.'}
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

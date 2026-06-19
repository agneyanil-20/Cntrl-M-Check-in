import React from 'react';
import { AlertTriangle, ShieldCheck, Wifi, Loader2 } from 'lucide-react';

interface NetworkStatusProps {
  isConnected: boolean;
  isCheckedIn: boolean;
  ssid: string;
  gatewayIp: string;
  localIp: string;
  isValidating: boolean;
  onRecheck?: () => void;
}

export function NetworkStatus({ 
  isConnected, 
  isCheckedIn, 
  ssid, 
  gatewayIp, 
  localIp, 
  isValidating,
  onRecheck 
}: NetworkStatusProps) {
  return (
    <div id="reusable-network-status" className="w-full text-center space-y-3.5 select-none animate-fade-in bg-gray-50/50 p-4 rounded-2xl border border-gray-150 shadow-xs">
      {/* Centered Chip Indicator */}
      <div className="flex justify-center items-center gap-2">
        <div
          id="network-status-badge"
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold border transition-all ${
            isConnected
              ? 'bg-emerald-50 text-emerald-950 border-emerald-300 shadow-xs'
              : 'bg-rose-50 text-rose-950 border-rose-300 shadow-xs'
          }`}
        >
          <span className="flex h-2.5 w-2.5 relative">
            {isConnected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-600 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected ? 'bg-emerald-600' : 'bg-rose-650'}`}></span>
          </span>
          
          <span className="font-retro uppercase tracking-wider text-[11px] font-black">
            {isConnected ? '🟢 Connected to Office Network' : '🔴 Not Connected' }
          </span>
        </div>

        {onRecheck && (
          <button
            type="button"
            onClick={onRecheck}
            disabled={isValidating}
            title="Scan network interfaces"
            className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 active:scale-95 disabled:opacity-50 transition-all cursor-pointer shadow-xs"
          >
            {isValidating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-500" />
            ) : (
              <Wifi className="w-3.5 h-3.5 text-gray-700" />
            )}
          </button>
        )}
      </div>

      {/* Real telemetry readout */}
      <div className="text-[10px] font-mono grid grid-cols-3 gap-1.5 p-2 bg-white rounded-xl border border-gray-150">
        <div className="text-center animate-fade-in">
          <div className="text-gray-400 font-bold uppercase text-[8px]">SSID Detected</div>
          <div className={`font-black truncate ${isConnected && ssid === 'CntrlM-5G' ? 'text-emerald-700 font-extrabold' : 'text-gray-600'}`}>
            {ssid}
          </div>
        </div>
        <div className="text-center border-x border-gray-100 animate-fade-in">
          <div className="text-gray-400 font-bold uppercase text-[8px]">Subnet Gateway</div>
          <div className={`font-black truncate ${isConnected && gatewayIp === '192.168.29.1' ? 'text-emerald-700 font-extrabold' : 'text-gray-600'}`}>
            {gatewayIp}
          </div>
        </div>
        <div className="text-center animate-fade-in">
          <div className="text-gray-400 font-bold uppercase text-[8px]">Local Address</div>
          <div className={`font-black truncate ${isConnected && localIp.startsWith('192.168.29.') ? 'text-emerald-700 font-extrabold' : 'text-gray-600'}`}>
            {localIp}
          </div>
        </div>
      </div>

      {/* Structured Helper text / Verification diagnostics */}
      <div className="min-h-[20px] flex items-center justify-center">
        {isValidating ? (
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono animate-pulse">
            🔍 Resolving local network interfaces...
          </p>
        ) : !isConnected ? (
          <div className="space-y-1 text-center">
            <p className="text-xs text-rose-600 font-semibold flex items-center justify-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Please connect to the office WiFi "CntrlM-5G" to verify identity.</span>
            </p>
          </div>
        ) : (
          <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider font-mono flex items-center justify-center gap-1 animate-bounce">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 fill-transparent" />
            <span>Secure 192.168.29.0/24 subnet validated!</span>
          </p>
        )}
      </div>
    </div>
  );
}

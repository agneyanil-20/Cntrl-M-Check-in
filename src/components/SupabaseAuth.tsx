import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LogIn, ShieldCheck, Mail, AlertCircle, Settings } from 'lucide-react';
import { dbService } from '../lib/database.service';
import { getSupabase } from '../lib/supabase';

interface SupabaseAuthProps {
  onSuccess?: () => void;
}

export function SupabaseAuth({ onSuccess }: SupabaseAuthProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const supabase = getSupabase();
      if (!supabase) {
        throw new Error('Supabase client failed to initialize. Please check the VITE_SUPABASE_ANON_KEY in project settings.');
      }
      const { error } = await dbService.signInWithGoogle();
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Failed to initialize login');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl border border-gray-100"
      >
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-[#EAFF00] rounded-3xl flex items-center justify-center shadow-lg transform -rotate-6">
            <ShieldCheck className="w-10 h-10 text-black" />
          </div>
        </div>

        <h2 className="text-2xl font-retro font-black uppercase tracking-tight text-gray-900 mb-2">
          Terminal Access
        </h2>
        <p className="text-gray-500 text-sm mb-8 font-medium">
          Secure biometric-proxied entrance for <span className="text-black font-bold">@cntrlm.com</span> authorized personnel only.
        </p>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-left"
          >
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <p className="text-xs text-rose-700 font-bold leading-relaxed">{error}</p>
          </motion.div>
        )}

        <button
          onClick={handleLogin}
          disabled={isLoading}
          className={`w-full h-14 bg-black text-white rounded-2xl flex items-center justify-center gap-3 font-retro font-black uppercase tracking-widest transition-all ${
            isLoading ? 'opacity-50 cursor-wait' : 'hover:bg-gray-900 active:scale-95'
          }`}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              <span>Sign in with Google</span>
            </>
          )}
        </button>

        <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-retro font-bold uppercase text-gray-400">
          <Mail className="w-3 h-3" />
          <span>Corporate G-Suite Only</span>
        </div>
      </motion.div>
      
      <p className="mt-8 text-[10px] font-mono font-bold uppercase text-gray-400 tracking-widest opacity-50">
        System Node: SG-1132-ALPHA
      </p>
    </div>
  );
}

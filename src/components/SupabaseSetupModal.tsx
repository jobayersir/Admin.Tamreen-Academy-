import React, { useState } from 'react';
import { Database, CheckCircle, AlertTriangle, Copy, Check, Server, ShieldCheck, X } from 'lucide-react';
import { isSupabaseConfigured, SUPABASE_SCHEMA_SQL } from '../lib/supabase';
import { useToast } from './Toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSetupModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopied(true);
    showToast('SQL Schema Copied!', 'Paste this into your Supabase SQL Editor and click Run.', 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-serif">Supabase Database Integration</h3>
            <p className="text-xs text-slate-400">Tamreen Academy Central Cloud Management System</p>
          </div>
        </div>

        {/* Connection Status Banner */}
        <div className={`p-4 rounded-xl border mb-6 flex items-start gap-3 ${
          isSupabaseConfigured
            ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
            : 'bg-amber-950/40 border-amber-800/80 text-amber-200'
        }`}>
          {isSupabaseConfigured ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="text-sm">
            <h4 className="font-semibold">
              {isSupabaseConfigured ? 'Live Supabase Connection Active' : 'Local Persistence Storage Mode Active'}
            </h4>
            <p className="text-xs opacity-90 mt-1 leading-relaxed">
              {isSupabaseConfigured
                ? 'Connected directly to your Supabase PostgreSQL instance. All questions, model tests, courses, and subscriptions sync live in real-time.'
                : 'Supabase credentials (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY) are not set. Don\'t worry! The app is fully operational with high-speed local persistence storage. Configure secrets in AI Studio Settings to connect your live Supabase database.'}
            </p>
          </div>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="space-y-4 text-sm text-slate-300">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              1. Environment Variables Configuration
            </h4>
            <p className="text-xs text-slate-400">Add the following keys in your Vercel or AI Studio Secrets panel:</p>
            <div className="font-mono text-xs bg-slate-900 p-3 rounded-lg text-emerald-300 overflow-x-auto space-y-1">
              <div>VITE_SUPABASE_URL=https://your-project.supabase.co</div>
              <div>VITE_SUPABASE_ANON_KEY=eyJhbGciOi...</div>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                2. Supabase SQL Schema DDL Script
              </h4>
              <button
                onClick={handleCopySchema}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-all shadow-md active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied SQL!' : 'Copy SQL Schema'}
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Click "Copy SQL Schema", open your Supabase Dashboard &gt; SQL Editor, paste and click "Run" to create all 7 tables with proper indexes.
            </p>
            <div className="font-mono text-[11px] bg-slate-900 p-3 rounded-lg text-slate-400 max-h-40 overflow-y-auto">
              <pre>{SUPABASE_SCHEMA_SQL}</pre>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

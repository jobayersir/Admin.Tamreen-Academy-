import React, { useState, useEffect } from 'react';
import { Database, CheckCircle, AlertTriangle, Copy, Check, Server, ShieldCheck, X, Link, RefreshCw, Trash2, KeyRound } from 'lucide-react';
import { 
  isSupabaseConfigured, 
  SUPABASE_SCHEMA_SQL, 
  getCustomSupabaseConfig, 
  saveCustomSupabaseConfig, 
  clearCustomSupabaseConfig, 
  testSupabaseConnection 
} from '../lib/supabase';
import { useToast } from './Toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSetupModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string } | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      const current = getCustomSupabaseConfig();
      setUrlInput(current.url);
      setKeyInput(current.key);
      setIsConnected(isSupabaseConfigured());
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopied(true);
    showToast('SQL Schema Copied!', 'Paste this into your Supabase SQL Editor and click Run.', 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim() || !keyInput.trim()) {
      setTestResult({ success: false, error: 'অনুগ্রহ করে Supabase Project URL এবং Anon Key পূরণ করুন।' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const res = await testSupabaseConnection(urlInput, keyInput);
    setIsTesting(false);
    setTestResult(res);

    if (res.success) {
      saveCustomSupabaseConfig(urlInput, keyInput);
      setIsConnected(true);
      showToast('Supabase কানেক্টেড!', 'সফলভাবে ক্লাউড ডাটাবেস সংযোগ ইনস্টল করা হয়েছে।', 'success');
    } else {
      // Even if database table is missing (42P01 error), if credentials are valid save them
      if (res.error && res.error.includes('টেবিলটি এখনো তৈরি হয়নি')) {
        saveCustomSupabaseConfig(urlInput, keyInput);
        setIsConnected(true);
        showToast('Supabase ক্রেনডেন্সিয়াল সংরক্ষিত!', 'টেবিল তৈরির জন্য নিচের SQL কোডটি রান করুন।', 'info');
      }
    }
  };

  const handleReset = () => {
    clearCustomSupabaseConfig();
    setUrlInput('');
    setKeyInput('');
    setIsConnected(isSupabaseConfigured());
    setTestResult(null);
    showToast('রিসেট সম্পন্ন', 'লোকাল স্টোরেজ মোডে ফিরে যাওয়া হয়েছে।', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto scrollbar-thin">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white font-serif">Supabase Database Integration</h3>
            <p className="text-xs text-slate-400">তমরীন একাডেমি সেন্ট্রাল ক্লাউড ডাটাবেস সংযোগ ও কনফিগারেশন</p>
          </div>
        </div>

        {/* Connection Status Banner */}
        <div className={`p-4 rounded-xl border mb-5 flex items-start gap-3 ${
          isConnected
            ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
            : 'bg-amber-950/40 border-amber-800/80 text-amber-200'
        }`}>
          {isConnected ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="text-xs sm:text-sm">
            <h4 className="font-bold flex items-center gap-2">
              {isConnected ? 'লাইভ Supabase সংযোগ সক্রিয়' : 'লোকাল পারসিস্টেন্স মোড (Offline High-Speed)'}
            </h4>
            <p className="text-xs opacity-90 mt-1 leading-relaxed">
              {isConnected
                ? 'আপনার অ্যাপ্লিকেশনটি সরাসরি Supabase PostgreSQL ডাটাবেসের সাথে যুক্ত। সকল প্রশ্ন, মডেল টেস্ট, কোর্স এবং ব্যবহারকারী তথ্য ক্লাউডে রিয়েল-টাইমে সেভ হচ্ছে।'
                : 'বর্তমানে অনলাইন Supabase ক্রেডেনশিয়াল যুক্ত নেই। অ্যাপটি দ্রুত গতিতে ব্রাউজার লোকাল স্টোরেজে সম্পূর্ণ কাজ করছে। সরাসরি ক্লাউড ডাটাবেস যুক্ত করতে নিচে Project URL এবং Anon Key বসিয়ে টেস্ট বাটনে ক্লিক করুন।'}
            </p>
          </div>
        </div>

        {/* Form to directly input credentials */}
        <form onSubmit={handleTestAndSave} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 font-serif">
              <Link className="w-4 h-4 text-emerald-400" />
              ১. সরাসরি Supabase ক্রেডেনশিয়াল যুক্ত করুন (Quick Connect)
            </h4>
            {isConnected && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900/80 text-emerald-300 font-mono font-bold border border-emerald-700">
                সংযুক্ত আছে
              </span>
            )}
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Supabase Project URL:
              </label>
              <input
                type="url"
                required
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://your-project-id.supabase.co"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1 flex items-center justify-between">
                <span>Supabase Anon API Key:</span>
                <span className="text-[10px] text-slate-400 font-mono">Project Settings &gt; API</span>
              </label>
              <textarea
                required
                rows={2}
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none font-mono text-[11px] resize-none"
              />
            </div>
          </div>

          {/* Test Error or Success Notification */}
          {testResult && (
            <div className={`p-3 rounded-xl border text-xs font-medium flex items-start gap-2 ${
              testResult.success
                ? 'bg-emerald-950/80 border-emerald-700 text-emerald-200'
                : 'bg-rose-950/80 border-rose-800 text-rose-200'
            }`}>
              {testResult.success ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <span>
                {testResult.success
                  ? 'সংযোগ সফল! আপনার Supabase ডাটাবেস প্রস্তুত ও কানেক্টেড।'
                  : testResult.error}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1 gap-2">
            <button
              type="submit"
              disabled={isTesting}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {isTesting ? (
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
              ) : (
                <KeyRound className="w-4 h-4" />
              )}
              <span>{isTesting ? 'টেস্ট করা হচ্ছে...' : 'টেস্ট এবং সেভ করুন'}</span>
            </button>

            {(urlInput || isConnected) && (
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-800 text-xs font-medium transition-colors flex items-center gap-1.5"
                title="ক্রেডেনশিয়াল সরিয়ে দিন"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">রিসেট করুন</span>
              </button>
            )}
          </div>
        </form>

        {/* Step-by-Step Instructions */}
        <div className="space-y-4 text-xs text-slate-300">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white flex items-center gap-2 font-serif text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                ২. Supabase SQL Schema DDL Script (ডাটাবেস টেবিল তৈরি)
              </h4>
              <button
                type="button"
                onClick={handleCopySchema}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-semibold transition-all shadow-md active:scale-95 shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'কপি হয়েছে!' : 'কপি SQL স্ক্রিপ্ট'}
              </button>
            </div>
            <p className="text-slate-400 leading-relaxed">
              যদি Supabase SQL রান না করে থাকেন: "কপি SQL স্ক্রিপ্ট" বাটনে ক্লিক করুন, আপনার Supabase Dashboard &gt; <strong>SQL Editor</strong>-এ গিয়ে পেস্ট করে <strong>Run</strong> বাটনে ক্লিক করুন। এতে সকল ৭টি প্রয়োজনীয় টেবিল তৈরি হয়ে যাবে।
            </p>
            <div className="font-mono text-[11px] bg-slate-900 p-3 rounded-xl text-slate-400 max-h-36 overflow-y-auto scrollbar-thin border border-slate-800">
              <pre>{SUPABASE_SCHEMA_SQL}</pre>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
          >
            সম্পন্ন (Done)
          </button>
        </div>
      </div>
    </div>
  );
};


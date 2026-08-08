import React from 'react';
import {
  Search,
  Bell,
  Database,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  PlusCircle,
  Code2,
  Moon,
  Sun
} from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';
import { TabId } from './Sidebar';

interface TopBarProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  onOpenSupabaseModal: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSupabaseModal,
  searchQuery,
  setSearchQuery,
  darkMode,
  setDarkMode
}) => {
  const getTabTitle = (id: TabId) => {
    switch (id) {
      case 'dashboard': return '📊 ড্যাশবোর্ড ওভারভিউ (System Dashboard)';
      case 'model_tests': return '📝 ফ্রি পরীক্ষা ও মডেল টেস্ট ম্যানেজার';
      case 'courses': return '📚 কোর্স, লাইভ ব্যাচ ও সাবস্ক্রিপশন প্ল্যান';
      case 'question_bank': return '🗄️ মাস্টার প্রশ্ন ব্যাংক (Master Question Bank)';
      case 'ai_hub': return '🤖 এআই স্মার্ট প্রশ্ন জেনারেটর ও টেক্সট এক্সট্রাক্টর';
      case 'written_exams': return '✍️ সিকিউ ও লিখিত পরীক্ষা গাইডলাইন';
      case 'glossary_resources': return '📖 আরবি শব্দকোষ ও ডাউনলোডযোগ্য রিসোর্স';
      case 'users_subscriptions': return '👥 শিক্ষার্থী ও ভিআইপি সাবস্ক্রিপশন এক্সেস';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between gap-4 text-slate-100">
      {/* Title & Breadcrumb */}
      <div className="flex items-center gap-3">
        <h1 className="text-base font-bold text-white font-serif tracking-tight hidden md:block">
          {getTabTitle(activeTab)}
        </h1>
      </div>

      {/* Center Search Bar */}
      <div className="flex-1 max-w-md relative hidden sm:block">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="প্রশ্ন, বিষয় বা আরবি শব্দ দিয়ে খুঁজুন..."
          className="w-full bg-slate-800/80 hover:bg-slate-800 focus:bg-slate-950 text-slate-100 text-xs rounded-xl pl-9 pr-4 py-2 border border-slate-700/80 focus:border-emerald-500 focus:outline-none transition-all placeholder:text-slate-500"
        />
      </div>

      {/* Right Controls & Profile */}
      <div className="flex items-center gap-2.5">
        {/* Quick Action: Generate AI Questions */}
        <button
          onClick={() => setActiveTab('ai_hub')}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold hover:border-amber-400 transition-all active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>এআই প্রশ্ন তৈরি</span>
        </button>

        {/* Supabase Connection Status Badge */}
        <button
          onClick={onOpenSupabaseModal}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
            isSupabaseConfigured
              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/80 hover:bg-emerald-900/80'
              : 'bg-amber-950/60 text-amber-300 border-amber-700/80 hover:bg-amber-900/80'
          }`}
          title="Click to manage Supabase database settings and SQL schema"
        >
          <Database className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {isSupabaseConfigured ? 'Supabase Live' : 'Local Storage'}
          </span>
          {isSupabaseConfigured ? (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          )}
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          title="Toggle Dark / Light Visual Mode"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
        </button>

        {/* Admin Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center font-bold text-white text-xs border border-emerald-400/30 shadow-md">
            জে
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-xs font-semibold text-white leading-tight">জোবায়ের হোসেন</span>
            <span className="text-[10px] text-emerald-400 font-mono">Head Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
};

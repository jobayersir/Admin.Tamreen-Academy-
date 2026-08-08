import React from 'react';
import {
  Menu,
  Search,
  Bell,
  Database,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  PlusCircle,
  Code2,
  Moon,
  Sun,
  Plus,
  CreditCard
} from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';
import { TabId } from './Sidebar';

interface TopBarProps {
  onOpenSidebar?: () => void;
  activeTab: TabId;
  setActiveTab?: (tab: TabId) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  isSupabaseConnected?: boolean;
  onOpenSupabaseModal: () => void;
  onQuickAddMCQ?: () => void;
  onOpenPayments?: () => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  darkMode?: boolean;
  setDarkMode?: (val: boolean) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenSidebar,
  activeTab,
  setActiveTab,
  isDarkMode,
  onToggleDarkMode,
  onOpenSupabaseModal,
  onQuickAddMCQ,
  onOpenPayments,
  searchQuery = '',
  setSearchQuery,
  darkMode,
  setDarkMode
}) => {
  const currentDarkMode = isDarkMode !== undefined ? isDarkMode : (darkMode ?? true);
  const handleToggleTheme = () => {
    if (onToggleDarkMode) onToggleDarkMode();
    else if (setDarkMode) setDarkMode(!currentDarkMode);
  };

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
    <header className="sticky top-0 z-30 h-16 bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between gap-3 text-slate-100">
      {/* Title & Menu Button */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-xl bg-slate-800/90 text-slate-200 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700/60 shrink-0"
          title="সাইডবার মেনু খুলুন (Open Menu)"
        >
          <Menu className="w-5 h-5 text-emerald-400" />
        </button>
        <h1 className="text-sm sm:text-base font-bold text-white font-serif tracking-tight truncate">
          {getTabTitle(activeTab)}
        </h1>
      </div>

      {/* Center Search Bar */}
      <div className="flex-1 max-w-md relative hidden md:block">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
          placeholder="প্রশ্ন, বিষয় বা আরবি শব্দ দিয়ে খুঁজুন..."
          className="w-full bg-slate-800/80 hover:bg-slate-800 focus:bg-slate-950 text-slate-100 text-xs rounded-xl pl-9 pr-4 py-2 border border-slate-700/80 focus:border-emerald-500 focus:outline-none transition-all placeholder:text-slate-500"
        />
      </div>

      {/* Right Controls & Profile */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Quick Add MCQ button */}
        {onQuickAddMCQ && (
          <button
            onClick={onQuickAddMCQ}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium shadow-md transition-all active:scale-95"
            title="দ্রুত নতুন প্রশ্ন যোগ করুন"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>নতুন MCQ</span>
          </button>
        )}

        {/* Payment Management Button */}
        {onOpenPayments && (
          <button
            onClick={onOpenPayments}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all active:scale-95"
            title="পেমেন্ট হিস্ট্রি ও ম্যানুয়াল ফি ট্রানজেকশন"
          >
            <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
            <span>পেমেন্ট ও ফি</span>
          </button>
        )}

        {/* Quick Action: Generate AI Questions */}
        {setActiveTab && (
          <button
            onClick={() => setActiveTab('ai_hub')}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold hover:border-amber-400 transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>এআই প্রশ্ন</span>
          </button>
        )}

        {/* Supabase Connection Status Badge */}
        <button
          onClick={onOpenSupabaseModal}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
            isSupabaseConfigured
              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/80 hover:bg-emerald-900/80'
              : 'bg-amber-950/60 text-amber-300 border-amber-700/80 hover:bg-amber-900/80'
          }`}
          title="Supabase Database Status"
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
          onClick={handleToggleTheme}
          className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700/60"
          title="Toggle Dark / Light Visual Mode"
        >
          {currentDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
        </button>

        {/* Admin Avatar */}
        <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-800">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center font-bold text-white text-xs border border-emerald-400/30 shadow-md">
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

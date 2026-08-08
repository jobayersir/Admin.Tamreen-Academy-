import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileCheck2,
  GraduationCap,
  Database,
  Sparkles,
  PenTool,
  BookMarked,
  Users,
  ChevronLeft,
  ChevronRight,
  X,
  Flame
} from 'lucide-react';

export type TabId =
  | 'dashboard'
  | 'model_tests'
  | 'courses'
  | 'question_bank'
  | 'ai_hub'
  | 'written_exams'
  | 'glossary_resources'
  | 'users_subscriptions';

interface SidebarProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  setIsCollapsed?: (col: boolean) => void;
  questionCount?: number;
  modelTestCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  isCollapsed: externalIsCollapsed,
  setIsCollapsed: externalSetIsCollapsed,
  questionCount = 0,
  modelTestCount = 0
}) => {
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(false);
  const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalIsCollapsed;
  const toggleCollapsed = () => {
    if (externalSetIsCollapsed) {
      externalSetIsCollapsed(!isCollapsed);
    } else {
      setInternalIsCollapsed(!internalIsCollapsed);
    }
  };

  const handleArrowClick = () => {
    // Always close sidebar on mobile drawer, and toggle collapse on desktop
    onClose();
    toggleCollapsed();
  };

  const menuItems: { id: TabId; labelBn: string; labelEn: string; icon: React.ReactNode; badge?: string | number; badgeColor?: string }[] = [
    {
      id: 'dashboard',
      labelBn: 'ড্যাশবোর্ড ও ওভারভিউ',
      labelEn: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      id: 'model_tests',
      labelBn: 'ফ্রি পরীক্ষা ও মডেল টেস্ট',
      labelEn: 'Model Tests',
      icon: <FileCheck2 className="w-5 h-5" />,
      badge: modelTestCount,
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30'
    },
    {
      id: 'courses',
      labelBn: 'কোর্স ও লাইভ ব্যাচ',
      labelEn: 'Courses & Batches',
      icon: <GraduationCap className="w-5 h-5" />
    },
    {
      id: 'question_bank',
      labelBn: 'মাস্টার প্রশ্ন ব্যাংক',
      labelEn: 'Question Bank',
      icon: <Database className="w-5 h-5" />,
      badge: questionCount,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    {
      id: 'ai_hub',
      labelBn: 'এআই প্রশ্ন তৈরি হাব',
      labelEn: 'AI Question Hub',
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
      badge: 'AI 3.6',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30 font-semibold'
    },
    {
      id: 'written_exams',
      labelBn: 'সিকিউ ও লিখিত পরীক্ষা',
      labelEn: 'Written & CQ Exams',
      icon: <PenTool className="w-5 h-5" />
    },
    {
      id: 'glossary_resources',
      labelBn: 'শব্দকোষ ও রিসোর্স',
      labelEn: 'Glossary & PDF Notes',
      icon: <BookMarked className="w-5 h-5" />
    },
    {
      id: 'users_subscriptions',
      labelBn: 'ব্যবহারকারী ও ভিআইপি এক্সেস',
      labelEn: 'Users & VIP Access',
      icon: <Users className="w-5 h-5" />
    }
  ];

  return (
    <>
      {/* Mobile Drawer Dark Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 bg-slate-900 border-r border-slate-800/80 text-slate-200 flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'w-72'}`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-serif font-bold text-xl shadow-lg shadow-emerald-950/50 shrink-0 border border-emerald-400/30">
              ত
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="font-bold text-white text-base tracking-wide font-serif leading-none truncate">
                  তামরীন একাডেমি
                </span>
                <span className="text-[11px] text-emerald-400 font-medium tracking-tight truncate mt-0.5">
                  NTRCA Cadre Admin CMS
                </span>
              </div>
            )}
          </div>
          <button
            onClick={handleArrowClick}
            className="text-slate-300 hover:text-white p-2 rounded-xl hover:bg-slate-800/80 transition-colors bg-slate-800/50 border border-slate-700/60"
            title="মেনু বন্ধ করুন (Close Menu)"
          >
            <ChevronLeft className="w-5 h-5 text-emerald-400" />
          </button>
        </div>

        {/* Target Cadre Banner */}
        {!isCollapsed && (
          <div className="mx-3 mt-3 p-3 rounded-xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-800/40 text-xs text-emerald-200/90 flex items-center gap-2.5">
            <Flame className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
            <div className="leading-tight">
              <span className="font-semibold text-white block">১৮তম NTRCA ক্যাডার স্পেশাল</span>
              <span className="text-[11px] text-slate-400">প্রভাষক ও সহকারী শিক্ষক (আরবি)</span>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/50 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
                title={isCollapsed ? `${item.labelBn} (${item.labelEn})` : undefined}
              >
                <span className={`shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'}`}>
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <div className="flex-1 text-left truncate flex items-center justify-between gap-1">
                    <div className="truncate flex flex-col">
                      <span className="truncate leading-tight text-[13px]">{item.labelBn}</span>
                      <span className="text-[10px] opacity-60 font-mono uppercase tracking-wider">{item.labelEn}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Info */}
        <div className="p-3 border-t border-slate-800/80 shrink-0 text-xs">
          {!isCollapsed ? (
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                v2.5 Full-Stack
              </span>
              <span className="text-slate-500 font-mono">Gemini 3.6 API</span>
            </div>
          ) : (
            <div className="flex justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="System Online" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

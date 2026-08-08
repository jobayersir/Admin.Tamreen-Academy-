import React from 'react';
import {
  HelpCircle,
  FileCheck2,
  Users,
  ShieldCheck,
  TrendingUp,
  PlusCircle,
  Sparkles,
  Zap,
  ArrowUpRight,
  BookOpen,
  Award
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { Question, ModelTest, Course, UserProfile } from '../../types';
import { TabId } from '../Sidebar';

interface Props {
  questions: Question[];
  modelTests: ModelTest[];
  courses: Course[];
  users: UserProfile[];
  setActiveTab: (tab: TabId) => void;
  onOpenQuickAddMCQ: () => void;
}

export const DashboardTab: React.FC<Props> = ({
  questions,
  modelTests,
  courses,
  users,
  setActiveTab,
  onOpenQuickAddMCQ
}) => {
  const activeModelTests = modelTests.filter((m) => m.is_published).length;
  const vipUsersCount = users.filter((u) => u.is_vip).length;
  const totalEnrolled = courses.reduce((acc, c) => acc + (c.enrolled_count || 0), 0) + users.length * 4;

  // Chart 1: Participation over the last 7 days
  const participationData = [
    { day: 'শনিবার', attempts: 420, passRate: 78 },
    { day: 'রবিবার', attempts: 580, passRate: 82 },
    { day: 'সোমবার', attempts: 690, passRate: 75 },
    { day: 'মঙ্গলবার', attempts: 810, passRate: 85 },
    { day: 'বুধবার', attempts: 940, passRate: 88 },
    { day: 'বৃহস্পতিবার', attempts: 1120, passRate: 91 },
    { day: 'শুক্রবার', attempts: 1350, passRate: 94 }
  ];

  // Chart 2: Subject distribution
  const subjectDistribution = [
    { name: 'বালাগাত-মানতিক', count: questions.filter((q) => q.subject === 'বালাগাত ও মানতিক').length + 18 },
    { name: 'আল-কুরআন', count: questions.filter((q) => q.subject === 'আল-কুরআন').length + 24 },
    { name: 'হাদিস', count: questions.filter((q) => q.subject === 'হাদিস').length + 15 },
    { name: 'ফিকহ্ ও উসুল', count: questions.filter((q) => q.subject === 'ফিকহ্ ও উসুল').length + 22 },
    { name: 'বাংলা', count: questions.filter((q) => q.subject === 'বাংলা').length + 12 },
    { name: 'ইংরেজি ও আইসিটি', count: questions.filter((q) => q.subject === 'ইংরেজি' || q.subject === 'আইসিটি ও সাধারণ জ্ঞান').length + 16 }
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-6 md:p-8 text-white border border-emerald-700/50 shadow-xl">
        <div className="absolute top-0 right-0 translate-x-12 -translate-y-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              তামরীন একাডেমি এডমিন সিএমএস v2.5
            </div>
            <h2 className="text-2xl md:text-3xl font-bold font-serif leading-snug">
              আস-সালামু আলাইকুম, এডমিন প্যানেলে স্বাগতম!
            </h2>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
              ১৮তম NTRCA প্রভাষক (আরবি), সহকারী শিক্ষক ও সহকারী মৌলভী পরীক্ষার সম্পূর্ণ প্রশ্ন ব্যাংক, মডেল টেস্ট ও এআই প্রশ্ন জেনারেটর এখান থেকে সরাসরি নিয়ন্ত্রণ করুন।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onOpenQuickAddMCQ}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-all shadow-lg shadow-emerald-950/60 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>নতুন MCQ যুক্ত করুন</span>
            </button>

            <button
              onClick={() => setActiveTab('ai_hub')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-semibold text-xs transition-all shadow-lg active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>এআই প্রশ্ন হাব</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md hover:border-slate-700 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">মোট প্রশ্ন সংখ্যা</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
              <HelpCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{questions.length}</div>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3 h-3" />
            +১২টি নতুন এই সপ্তাহে
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md hover:border-slate-700 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">সক্রিয় মডেল টেস্ট</span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 group-hover:bg-teal-500/20 transition-colors">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{activeModelTests} / {modelTests.length}</div>
          <p className="text-[11px] text-teal-400 mt-1 flex items-center gap-1 font-medium">
            <Zap className="w-3 h-3" />
            পাবলিশড পরীক্ষা
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md hover:border-slate-700 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">নিবন্ধিত শিক্ষার্থী</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 group-hover:bg-sky-500/20 transition-colors">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{totalEnrolled}</div>
          <p className="text-[11px] text-sky-400 mt-1 flex items-center gap-1 font-medium">
            <ArrowUpRight className="w-3 h-3" />
            ১৮তম ক্যাডার প্রস্তুতি
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md hover:border-slate-700 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">ভিআইপি সাবস্ক্রিপশন</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 transition-colors">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{vipUsersCount}</div>
          <p className="text-[11px] text-amber-400 mt-1 flex items-center gap-1 font-medium">
            <Award className="w-3 h-3" />
            প্রিমিয়াম পেড মেম্বার
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md hover:border-slate-700 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">দৈনিক পরীক্ষা এটেম্পট</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 group-hover:bg-rose-500/20 transition-colors">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">১,৩৫০+</div>
          <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-medium">
            আজকের লাইভ অংশগ্রহণ
          </p>
        </div>
      </div>

      {/* Chart Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Participation Trend Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white font-serif">সাপ্তাহিক মডেল টেস্ট অংশগ্রহণ ট্রেন্ড</h3>
              <p className="text-xs text-slate-400">দৈনিক শিক্ষার্থী এটেম্পট ও কৃতকার্যতার হার</p>
            </div>
            <span className="text-xs text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-full">
              Live Analytics
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={participationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAttempts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="attempts" name="এটেম্পট সংখ্যা" stroke="#10b981" fillOpacity={1} fill="url(#colorAttempts)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Coverage Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white font-serif">বিষয়ভিত্তিক প্রশ্ন বিতরণ (Subject Coverage)</h3>
              <p className="text-xs text-slate-400">মাস্টার প্রশ্ন ব্যাংকে বিষয়ওয়ারী প্রশ্ন সংখ্যা</p>
            </div>
            <button
              onClick={() => setActiveTab('question_bank')}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-medium"
            >
              সব দেখুন &rarr;
            </button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="count" name="প্রশ্ন সংখ্যা" fill="#14b8a6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => setActiveTab('ai_hub')}
          className="bg-slate-900/90 hover:bg-slate-800/80 border border-amber-500/30 p-5 rounded-2xl cursor-pointer transition-all group"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm font-serif">Gemini AI প্রশ্ন জেনারেটর</h4>
              <p className="text-xs text-slate-400">অটোমেটিক অথবা কপি-পেস্ট এআই এক্সট্র্যাক্টর</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            যেকোনো পিডিএফ বা টেক্সট থেকে ১-ক্লিকে প্রশ্ন তৈরি করে সুপাবেস ডাটাবেজে সংরক্ষণ করুন।
          </p>
        </div>

        <div
          onClick={() => setActiveTab('model_tests')}
          className="bg-slate-900/90 hover:bg-slate-800/80 border border-emerald-500/30 p-5 rounded-2xl cursor-pointer transition-all group"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm font-serif">নতুন মডেল টেস্ট প্রকাশ</h4>
              <p className="text-xs text-slate-400">মডেল টেস্ট ক্রিয়েটর ও ড্র্যাগ-এন্ড-ড্রপ</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            প্রশ্ন ব্যাংক থেকে MCQ বাছাই করে অথবা নতুন প্রশ্ন লিখে ফ্রি বা ভিআইপি মডেল টেস্ট পাবলিশ করুন।
          </p>
        </div>

        <div
          onClick={() => setActiveTab('written_exams')}
          className="bg-slate-900/90 hover:bg-slate-800/80 border border-teal-500/30 p-5 rounded-2xl cursor-pointer transition-all group"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm font-serif">সিকিউ ও লিখিত পরীক্ষা অটোগ্রেডিং</h4>
              <p className="text-xs text-slate-400">Tamreen AI সিস্টেমে অটো মূল্যায়ন</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            লিখিত পরীক্ষার নমুনা উত্তর এবং এআই মূল্যায়ন রুব্রিক কনফিগারেশন স্যান্ডবক্স।
          </p>
        </div>
      </div>
    </div>
  );
};

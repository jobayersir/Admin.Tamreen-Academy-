import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Plus,
  Search,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  Edit,
  ShieldCheck,
  Check,
  MoveUp,
  MoveDown,
  Sparkles,
  X,
  FileEdit,
  Globe,
  Calendar,
  Lock,
  Timer,
  Smartphone,
  Shield,
  Play,
  Zap,
  AlertCircle
} from 'lucide-react';
import { ModelTest, Question, Subject, CadreTier } from '../../types';
import { useToast } from '../Toast';

// Helper to convert numbers to Bengali digits
export const toBengaliDigits = (num: number | string): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (digit) => bnDigits[parseInt(digit, 10)] || digit);
};

// Helper to format ISO date string to Bengali date and time
export const formatBengaliDateTime = (dateStr?: string): string => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const months = [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    const timeFormatted = `${toBengaliDigits(hours)}:${toBengaliDigits(String(minutes).padStart(2, '0'))} ${ampm}`;
    return `${toBengaliDigits(day)} ${month}, ${toBengaliDigits(year)} ${timeFormatted}`;
  } catch {
    return dateStr;
  }
};

// Countdown Timer Component for Scheduled Upcoming Tests
const CountdownTimer: React.FC<{ targetDate: string; onExpire?: () => void }> = ({ targetDate, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        if (onExpire) onExpire();
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft.isExpired) {
    return (
      <span className="text-emerald-400 font-bold flex items-center gap-1 text-xs">
        <Sparkles className="w-3.5 h-3.5 animate-bounce text-emerald-400" />
        পরীক্ষাটি এখন লাইভ!
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1 font-mono text-[11px] font-bold text-amber-300 bg-amber-950/80 border border-amber-500/40 px-2.5 py-1 rounded-lg">
      <Timer className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
      <span>
        {timeLeft.days > 0 && `${toBengaliDigits(timeLeft.days)} দিন `}
        {toBengaliDigits(String(timeLeft.hours).padStart(2, '0'))} ঘণ্টা{' '}
        {toBengaliDigits(String(timeLeft.minutes).padStart(2, '0'))} মি.{' '}
        {toBengaliDigits(String(timeLeft.seconds).padStart(2, '0'))} সে. পর শুরু
      </span>
    </div>
  );
};

interface Props {
  modelTests: ModelTest[];
  questions: Question[];
  onSaveModelTest: (test: Omit<ModelTest, 'id' | 'created_at'> & { id?: string }) => Promise<void>;
  onDeleteModelTest: (id: string) => Promise<void>;
}

export const ModelTestsTab: React.FC<Props> = ({
  modelTests,
  questions,
  onSaveModelTest,
  onDeleteModelTest
}) => {
  const { showToast } = useToast();
  
  // Top View Switcher: 'admin' (Management Panel) vs 'student_app' (Student App Live View)
  const [viewMode, setViewMode] = useState<'admin' | 'student_app'>('admin');

  // Filters & Search State
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [studentTab, setStudentTab] = useState<'all' | 'live' | 'upcoming'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<Partial<ModelTest> | null>(null);

  // Preview Modal
  const [previewTest, setPreviewTest] = useState<ModelTest | null>(null);

  // Live Exam Runner Modal State
  const [activeExam, setActiveExam] = useState<ModelTest | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examTimeLeft, setExamTimeLeft] = useState(0);

  // Scheduled Launch Form State
  const [isScheduled, setIsScheduled] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    subtitle: '',
    subject: 'বালাগাত ও মানতিক' as Subject,
    cadre_tier: 'প্রভাষক (আরবি)' as CadreTier,
    duration_minutes: 60,
    total_marks: 100,
    pass_mark: 50,
    negative_marking: true,
    is_premium: false,
    is_published: true,
    scheduled_at: '',
    show_as_upcoming: true,
    question_ids: [] as string[]
  });

  const subjectsList: Subject[] = [
    'বালাগাত ও মানতিক',
    'আল-কুরআন',
    'হাদিস',
    'ফিকহ্ ও উসুল',
    'বাংলা',
    'ইংরেজি',
    'আইসিটি ও সাধারণ জ্ঞান'
  ];

  const cadreTiersList: CadreTier[] = [
    'প্রভাষক (আরবি)',
    'সহকারী শিক্ষক (আরবি)',
    'সহকারী মৌলভী',
    'ইবতেদায়ী প্রধান'
  ];

  // Live Exam Runner Timer
  useEffect(() => {
    if (!activeExam || examSubmitted || examTimeLeft <= 0) return;
    const interval = setInterval(() => {
      setExamTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setExamSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeExam, examSubmitted, examTimeLeft]);

  const handleStartLiveExam = (test: ModelTest) => {
    setActiveExam(test);
    setUserAnswers({});
    setExamSubmitted(false);
    setExamTimeLeft((test.duration_minutes || 60) * 60);
  };

  // Helper function to check test schedule status
  const getTestScheduleState = (test: ModelTest) => {
    if (!test.is_published) {
      return { isDraft: true, isUpcoming: false, isLive: false };
    }

    if (test.scheduled_at) {
      const scheduledTime = new Date(test.scheduled_at).getTime();
      const now = new Date().getTime();
      if (!isNaN(scheduledTime) && scheduledTime > now) {
        return { isDraft: false, isUpcoming: true, isLive: false };
      }
    }

    return { isDraft: false, isUpcoming: false, isLive: true };
  };

  // Admin View Filter Logic
  const filteredAdminTests = modelTests.filter((test) => {
    const matchesSearch =
      test.title.toLowerCase().includes(search.toLowerCase()) ||
      test.subtitle.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = selectedSubject === 'All' || test.subject === selectedSubject;
    
    const schedState = getTestScheduleState(test);

    let matchesStatus = true;
    if (selectedStatus === 'Published') matchesStatus = test.is_published && !schedState.isUpcoming;
    else if (selectedStatus === 'Draft') matchesStatus = !test.is_published;
    else if (selectedStatus === 'Scheduled') matchesStatus = test.is_published && schedState.isUpcoming;
    else if (selectedStatus === 'VIP') matchesStatus = test.is_premium;
    else if (selectedStatus === 'Free') matchesStatus = !test.is_premium;

    return matchesSearch && matchesSubject && matchesStatus;
  });

  // Student App View Filter Logic
  // RULES:
  // 1. MUST NOT show draft tests (is_published === false)
  // 2. Scheduled test with scheduled_at in the future:
  //    - show_as_upcoming === false -> HIDDEN from student view until scheduled_at arrives
  //    - show_as_upcoming === true -> SHOWN as UPCOMING test with countdown timer & lock icon
  // 3. Normal published test or scheduled test whose launch time has arrived -> SHOWN as LIVE ACTIVE test
  const studentAppVisibleTests = modelTests.filter((test) => {
    // Rule 1: Draft tests are strictly hidden from student app
    if (!test.is_published) return false;

    const matchesSearch =
      test.title.toLowerCase().includes(search.toLowerCase()) ||
      test.subtitle.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = selectedSubject === 'All' || test.subject === selectedSubject;

    if (!matchesSearch || !matchesSubject) return false;

    const schedState = getTestScheduleState(test);

    // Rule 2: If test is scheduled for future
    if (schedState.isUpcoming) {
      // If show_as_upcoming is false, hide completely from app until launch time
      if (!test.show_as_upcoming) return false;

      // If student tab is 'live', exclude upcoming
      if (studentTab === 'live') return false;
      return true;
    }

    // Rule 3: Test is Live
    if (studentTab === 'upcoming') return false;
    return true;
  });

  const handleOpenCreate = () => {
    setFormData({
      id: '',
      title: '',
      subtitle: '',
      subject: 'বালাগাত ও মানতিক',
      cadre_tier: 'প্রভাষক (আরবি)',
      duration_minutes: 60,
      total_marks: 100,
      pass_mark: 50,
      negative_marking: true,
      is_premium: false,
      is_published: true,
      scheduled_at: '',
      show_as_upcoming: true,
      question_ids: questions.slice(0, 5).map((q) => q.id)
    });
    setIsScheduled(false);
    setEditingTest(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (test: ModelTest) => {
    setFormData({
      id: test.id,
      title: test.title,
      subtitle: test.subtitle,
      subject: test.subject,
      cadre_tier: test.cadre_tier,
      duration_minutes: test.duration_minutes,
      total_marks: test.total_marks,
      pass_mark: test.pass_mark,
      negative_marking: test.negative_marking,
      is_premium: test.is_premium,
      is_published: test.is_published,
      scheduled_at: test.scheduled_at || '',
      show_as_upcoming: test.show_as_upcoming !== undefined ? test.show_as_upcoming : true,
      question_ids: test.question_ids || []
    });
    setIsScheduled(Boolean(test.scheduled_at));
    setEditingTest(test);
    setIsModalOpen(true);
  };

  const handleSaveWithStatus = async (publishState: boolean) => {
    if (!formData.title.trim()) {
      showToast('ত্রুটি', 'মডেল টেস্ট শিরোনাম টাইপ করুন', 'error');
      return;
    }

    const scheduledAtValue = isScheduled && formData.scheduled_at ? formData.scheduled_at : undefined;

    try {
      const saved = await onSaveModelTest({
        id: formData.id || undefined,
        title: formData.title,
        subtitle: formData.subtitle,
        subject: formData.subject,
        cadre_tier: formData.cadre_tier,
        duration_minutes: Number(formData.duration_minutes),
        total_marks: Number(formData.total_marks),
        pass_mark: Number(formData.pass_mark),
        negative_marking: formData.negative_marking,
        is_premium: formData.is_premium,
        is_published: publishState,
        scheduled_at: scheduledAtValue,
        show_as_upcoming: formData.show_as_upcoming,
        question_ids: formData.question_ids
      });

      const title = saved?.title || formData.title;

      if (!publishState) {
        showToast(
          'ড্রাফট হিসেবে সংরক্ষিত',
          `"${title}" খসড়া ফোল্ডারে সেভ করা হয়েছে (অ্যাপে গোপন থাকবে)।`,
          'info'
        );
      } else if (scheduledAtValue && new Date(scheduledAtValue).getTime() > new Date().getTime()) {
        showToast(
          'অগ্রীম সময় সেট করা হয়েছে!',
          `"${title}" পরীক্ষাটি ${formatBengaliDateTime(scheduledAtValue)} তারিখে প্রকাশের জন্য শিডিউল করা হলো।`,
          'success'
        );
      } else {
        showToast(
          'সরাসরি পাবলিশড ও লাইভ!',
          `"${title}" পরীক্ষাটি সরাসরি শিক্ষার্থীদের অ্যাপে লাইভ করা হলো।`,
          'success'
        );
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('[Model Test Save Error]:', err);
      showToast(
        'সেভ করা ব্যর্থ হয়েছে!',
        err.message || 'ডাটাবেসে মডেল টেস্ট সেভ করার সময় ত্রুটি ঘটেছে।',
        'error'
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSaveWithStatus(formData.is_published);
  };

  const handleToggleQuestionInTest = (qId: string) => {
    setFormData((prev) => {
      const exists = prev.question_ids.includes(qId);
      if (exists) {
        return { ...prev, question_ids: prev.question_ids.filter((id) => id !== qId) };
      } else {
        return { ...prev, question_ids: [...prev.question_ids, qId] };
      }
    });
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    const updated = [...formData.question_ids];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= updated.length) return;
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setFormData((prev) => ({ ...prev, question_ids: updated }));
  };

  const handleTogglePublish = async (test: ModelTest) => {
    try {
      await onSaveModelTest({
        ...test,
        is_published: !test.is_published
      });
      showToast(
        test.is_published ? 'Unpublished (Draft)' : 'Published (Live)',
        `"${test.title}" পরীক্ষাটির পাবলিশড স্ট্যাটাস পরিবর্তন করা হয়েছে।`,
        'info'
      );
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`আপনি কি নিশ্চিত যে "${title}" মডেল টেস্টটি মুছে ফেলতে চান?`)) {
      try {
        await onDeleteModelTest(id);
        showToast('Deleted', `"${title}" সফলভাবে ডিলিট করা হয়েছে।`, 'success');
      } catch (err: any) {
        showToast('Error', err.message, 'error');
      }
    }
  };

  // Metrics counters for Admin overview
  const totalCount = modelTests.length;
  const publishedCount = modelTests.filter((m) => m.is_published && (!m.scheduled_at || new Date(m.scheduled_at).getTime() <= new Date().getTime())).length;
  const draftCount = modelTests.filter((m) => !m.is_published).length;
  const scheduledCount = modelTests.filter((m) => m.is_published && m.scheduled_at && new Date(m.scheduled_at).getTime() > new Date().getTime()).length;

  return (
    <div className="space-y-6">
      {/* Top Main Banner & View Switcher */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              তামরীন একাডেমি মডেল টেস্ট হাব
            </span>
          </div>
          <h2 className="text-xl font-bold text-white font-serif flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-emerald-400" />
            মডেল টেস্ট ও স্পেশাল পরীক্ষা ব্যবস্থাপনা ({totalCount}টি পরীক্ষা)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            NTRCA ক্যাডার ভিত্তিক মডেল টেস্ট তৈরি, ড্রাইটিং, অগ্রীম লঞ্চ শিডিউলিং ও অটোমেটিক কাউন্টডাউন।
          </p>
        </div>

        {/* View Switcher Tabs (Admin Panel vs Student App View) */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => setViewMode('admin')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'admin'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>এডমিন প্যানেল ভিউ</span>
          </button>

          <button
            onClick={() => setViewMode('student_app')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'student_app'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-200" />
            <span>শিক্ষার্থী / অ্যাপ ভিউ</span>
          </button>

          {viewMode === 'admin' && (
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md active:scale-95 ml-1"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন পরীক্ষা</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ADMIN MANAGEMENT VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'admin' && (
        <div className="space-y-6">
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">মোট মডেল টেস্ট</span>
                <strong className="text-xl font-bold text-white font-mono">{toBengaliDigits(totalCount)}টি</strong>
              </div>
              <FileCheck2 className="w-6 h-6 text-slate-500" />
            </div>

            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] text-emerald-400 block font-medium">সরাসরি লাইভ (Published)</span>
                <strong className="text-xl font-bold text-emerald-300 font-mono">{toBengaliDigits(publishedCount)}টি</strong>
              </div>
              <Globe className="w-6 h-6 text-emerald-500" />
            </div>

            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] text-amber-400 block font-medium">শিডিউলড (Scheduled Launch)</span>
                <strong className="text-xl font-bold text-amber-300 font-mono">{toBengaliDigits(scheduledCount)}টি</strong>
              </div>
              <Calendar className="w-6 h-6 text-amber-500" />
            </div>

            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">ড্রাফট (App Hidden)</span>
                <strong className="text-xl font-bold text-slate-300 font-mono">{toBengaliDigits(draftCount)}টি</strong>
              </div>
              <FileEdit className="w-6 h-6 text-slate-400" />
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="পরীক্ষার নাম খুঁজুন..."
                className="w-full bg-slate-900 text-slate-100 text-xs rounded-xl pl-9 pr-4 py-2.5 border border-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-slate-900 text-slate-200 text-xs rounded-xl px-3 py-2.5 border border-slate-800 focus:border-emerald-500 focus:outline-none"
            >
              <option value="All">সব বিষয় (All Subjects)</option>
              {subjectsList.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-900 text-slate-200 text-xs rounded-xl px-3 py-2.5 border border-slate-800 focus:border-emerald-500 focus:outline-none"
            >
              <option value="All">সব স্ট্যাটাস (All Status)</option>
              <option value="Published">সরাসরি লাইভ (Live Published)</option>
              <option value="Scheduled">অগ্রীম শিডিউলড (Scheduled Launch)</option>
              <option value="Draft">ড্রাফট (Draft - App Hidden)</option>
              <option value="VIP">ভিআইপি প্রিমিয়াম (VIP Only)</option>
              <option value="Free">ফ্রি টেস্ট (Free)</option>
            </select>
          </div>

          {/* Model Tests Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAdminTests.map((test) => {
              const qCount = test.question_ids?.length || 0;
              const schedState = getTestScheduleState(test);

              return (
                <div
                  key={test.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md group relative overflow-hidden"
                >
                  <div className="space-y-3">
                    {/* Status & Category Badges */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700 font-medium">
                        {test.subject}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {test.is_premium ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-amber-400" />
                            VIP
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-medium">
                            Free
                          </span>
                        )}

                        {/* Status Toggle Button */}
                        <button
                          onClick={() => handleTogglePublish(test)}
                          className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold transition-all flex items-center gap-1 ${
                            schedState.isDraft
                              ? 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'
                              : schedState.isUpcoming
                              ? 'bg-amber-950 text-amber-300 border-amber-700 hover:bg-amber-900'
                              : 'bg-emerald-950 text-emerald-300 border-emerald-700 hover:bg-emerald-900'
                          }`}
                          title="পাবলিশ/ড্রাফট স্ট্যাটাস পরিবর্তন করতে ক্লিক করুন"
                        >
                          {schedState.isDraft && (
                            <>
                              <FileEdit className="w-3 h-3 text-slate-400" />
                              <span>ড্রাফট (App Hidden)</span>
                            </>
                          )}
                          {schedState.isUpcoming && (
                            <>
                              <Calendar className="w-3 h-3 text-amber-400" />
                              <span>শিডিউলড (Upcoming)</span>
                            </>
                          )}
                          {schedState.isLive && (
                            <>
                              <Globe className="w-3 h-3 text-emerald-400" />
                              <span>লাইভ (Published)</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Title & Subtitle */}
                    <div>
                      <h3 className="text-base font-bold text-white font-serif leading-snug group-hover:text-emerald-300 transition-colors">
                        {test.title}
                      </h3>
                      {test.subtitle && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                          {test.subtitle}
                        </p>
                      )}
                    </div>

                    {/* Scheduled Info & Countdown Banner if Scheduled */}
                    {test.scheduled_at && schedState.isUpcoming && (
                      <div className="bg-slate-950/90 border border-amber-500/30 p-2.5 rounded-xl space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-[11px] text-amber-300">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-amber-400" />
                            প্রকাশের সময়:
                          </span>
                          <span className="font-semibold">{formatBengaliDateTime(test.scheduled_at)}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>অ্যাপে আপকামিং দেখাবে:</span>
                          <span className={test.show_as_upcoming ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                            {test.show_as_upcoming ? 'হ্যাঁ (কাউন্টডাউন সহ)' : 'না (হিডেন)'}
                          </span>
                        </div>
                        {test.show_as_upcoming && (
                          <div className="pt-1">
                            <CountdownTimer targetDate={test.scheduled_at} />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Metrics Meta (Exact Questions, Time, Marks) */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-300 font-mono">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{toBengaliDigits(test.duration_minutes)} মিনিট</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-slate-400" />
                        <span>{toBengaliDigits(test.total_marks)} মার্কস</span>
                      </div>
                      <div className="flex items-center gap-1 justify-end">
                        <span className="text-emerald-400 font-bold">{toBengaliDigits(qCount)}টি MCQ</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800/80 gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setPreviewTest(test)}
                        className="text-xs text-slate-300 hover:text-emerald-400 flex items-center gap-1 font-medium transition-colors px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60"
                        title="প্রশ্নোত্তর রিভিউ দেখুন"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>পূর্বরূপ</span>
                      </button>

                      <button
                        onClick={() => handleStartLiveExam(test)}
                        className="text-xs text-emerald-300 hover:text-emerald-200 flex items-center gap-1 font-medium transition-colors px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800/60"
                        title="নিজে পরীক্ষা দিয়ে যাচাই করুন"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>টেস্ট পরীক্ষা</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(test)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="এডিট করুন"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(test.id, test.title)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredAdminTests.length === 0 && (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-sm space-y-2">
              <FileCheck2 className="w-10 h-10 mx-auto text-slate-600" />
              <p>কোনো মডেল টেস্ট পাওয়া যায়নি।</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* STUDENT / APP REAL VIEW MODE */}
      {/* ========================================================================= */}
      {viewMode === 'student_app' && (
        <div className="space-y-6">
          {/* Student Banner Notice */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-800/60 p-4 rounded-2xl flex items-start gap-3">
            <Smartphone className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-emerald-300 text-sm">শিক্ষার্থী মোবাইল অ্যাপ উইন্ডো (Live Student Interface)</h4>
              <p className="text-slate-300 leading-relaxed">
                এখানে শিক্ষার্থীরা যেভাবে অ্যাপে মডেল টেস্টসমূহ দেখতে পাবে তা সরাসরি প্রদর্শিত হচ্ছে।{' '}
                <strong className="text-amber-300">ড্রাফট পরীক্ষাগুলো শিক্ষার্থী অ্যাপ থেকে সম্পূর্ণ হিডেন থাকে।</strong>{' '}
                অগ্রীম সময় সেট করা থাকলে অ্যাপে 'আপকামিং' হিসেবে কাউন্টডাউন টাইমার সহ দেখাবে।
              </p>
            </div>
          </div>

          {/* Student Sub Tabs */}
          <div className="flex items-center justify-between flex-wrap gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStudentTab('all')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  studentTab === 'all'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                সব পরীক্ষা (All)
              </button>

              <button
                onClick={() => setStudentTab('live')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  studentTab === 'live'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>চলতি পরীক্ষা (Live Now)</span>
              </button>

              <button
                onClick={() => setStudentTab('upcoming')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  studentTab === 'upcoming'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                <span>আপকামিং পরীক্ষা (Upcoming)</span>
              </button>
            </div>

            {/* Subject Dropdown */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-slate-950 text-slate-200 text-xs rounded-xl px-3 py-1.5 border border-slate-800 focus:border-emerald-500 focus:outline-none"
            >
              <option value="All">সব বিষয় (Filter by Subject)</option>
              {subjectsList.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Student Visible Tests Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {studentAppVisibleTests.map((test) => {
              const qCount = test.question_ids?.length || 0;
              const schedState = getTestScheduleState(test);

              return (
                <div
                  key={test.id}
                  className={`border rounded-2xl p-5 flex flex-col justify-between transition-all shadow-lg relative overflow-hidden ${
                    schedState.isUpcoming
                      ? 'bg-slate-900/90 border-amber-500/40 hover:border-amber-500/70'
                      : 'bg-slate-900 border-slate-800 hover:border-emerald-500/50'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700 font-medium">
                        {test.subject} &bull; {test.cadre_tier}
                      </span>

                      {schedState.isUpcoming ? (
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400 animate-spin" />
                          আপকামিং
                        </span>
                      ) : (
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-300" />
                          লাইভ পরীক্ষা
                        </span>
                      )}
                    </div>

                    {/* Title & Subtitle */}
                    <div>
                      <h3 className="text-base font-bold text-white font-serif leading-snug">
                        {test.title}
                      </h3>
                      {test.subtitle && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                          {test.subtitle}
                        </p>
                      )}
                    </div>

                    {/* Upcoming Launch Notice & Live Countdown Timer */}
                    {schedState.isUpcoming && test.scheduled_at && (
                      <div className="bg-amber-950/40 border border-amber-500/30 p-3 rounded-xl space-y-2">
                        <div className="text-[11px] text-amber-200 flex items-center justify-between">
                          <span className="font-medium flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-amber-400" />
                            পরীক্ষা শুরু:
                          </span>
                          <span className="font-bold">{formatBengaliDateTime(test.scheduled_at)}</span>
                        </div>
                        <CountdownTimer targetDate={test.scheduled_at} />
                      </div>
                    )}

                    {/* Metrics Meta (Questions, Duration, Total Marks) */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-300 font-mono">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{toBengaliDigits(test.duration_minutes)} মিনিট</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-slate-400" />
                        <span>{toBengaliDigits(test.total_marks)} মার্কস</span>
                      </div>
                      <div className="flex items-center gap-1 justify-end">
                        <span className="text-emerald-400 font-bold">{toBengaliDigits(qCount)}টি MCQ</span>
                      </div>
                    </div>
                  </div>

                  {/* Student Start Exam Action */}
                  <div className="pt-4 mt-4 border-t border-slate-800/80">
                    {schedState.isUpcoming ? (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-xl bg-slate-800/90 text-slate-400 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-2 cursor-not-allowed opacity-80"
                      >
                        <Lock className="w-4 h-4 text-amber-400" />
                        <span>নির্ধারিত সময়ে উন্মুক্ত হবে</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartLiveExam(test)}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/80 transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>পরীক্ষা শুরু করুন (Start Exam)</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {studentAppVisibleTests.length === 0 && (
            <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-sm space-y-2">
              <Smartphone className="w-12 h-12 mx-auto text-slate-600" />
              <p className="font-semibold text-slate-300">শিক্ষার্থী অ্যাপে দেখানোর মতো কোনো পরীক্ষা পাওয়া যায়নি।</p>
              <p className="text-xs text-slate-500">
                ড্রাফট পরীক্ষাগুলো শিক্ষার্থী অ্যাপে হাইড থাকে। অ্যাডমিন প্যানেল থেকে পাবলিশ করুন।
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* CREATE / EDIT MODEL TEST MODAL */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white font-serif mb-4 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-emerald-400" />
              {editingTest ? 'মডেল টেস্ট এডিট করুন' : 'নতুন মডেল টেস্ট তৈরি করুন'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">মডেল টেস্ট শিরোনাম *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="যেমন: NTRCA ১৮তম প্রভাষক (আরবি) স্পেশাল মডেল টেস্ট - ০১"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">সাবটাইটেল / ব্যাচ নাম</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="যেমন: বালাগাত, মানতিক ও হাদিস বিশেষ প্রস্তুতি"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">বিষয় (Subject)</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value as Subject })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                  >
                    {subjectsList.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">টার্গেট ক্যাডার (Target Cadre)</label>
                  <select
                    value={formData.cadre_tier}
                    onChange={(e) => setFormData({ ...formData, cadre_tier: e.target.value as CadreTier })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                  >
                    {cadreTiersList.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">সময় (মিনিট)</label>
                  <input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">মোট মার্কস</label>
                  <input
                    type="number"
                    value={formData.total_marks}
                    onChange={(e) => setFormData({ ...formData, total_marks: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">পাস মার্কস</label>
                  <input
                    type="number"
                    value={formData.pass_mark}
                    onChange={(e) => setFormData({ ...formData, pass_mark: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Toggles & Draft/Publish Status */}
              <div className="space-y-3 p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.negative_marking}
                        onChange={(e) => setFormData({ ...formData, negative_marking: e.target.checked })}
                        className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span>নেগেটিভ মার্কিং (0.25 কাটা যাবে)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_premium}
                        onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
                        className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
                      />
                      <span className="text-amber-400 font-medium">ভিআইপি প্রিমিয়াম মেম্বার ওনলি</span>
                    </label>
                  </div>

                  {/* Draft vs Published Selector */}
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, is_published: false })}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1 ${
                        !formData.is_published
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-800 shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <FileEdit className="w-3.5 h-3.5" />
                      <span>ড্রাফট (App Hidden)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, is_published: true })}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1 ${
                        formData.is_published
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>পাবলিশড (App Visible)</span>
                    </button>
                  </div>
                </div>

                {/* SCHEDULED LAUNCH SETTINGS */}
                <div className="pt-3 border-t border-slate-800/80 space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isScheduled}
                      onChange={(e) => {
                        setIsScheduled(e.target.checked);
                        if (!e.target.checked) {
                          setFormData((prev) => ({ ...prev, scheduled_at: '' }));
                        }
                      }}
                      className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-amber-400" />
                      অগ্রীম মডেল টেস্ট শিডিউল লঞ্চ (Set Future Release Date & Time)
                    </span>
                  </label>

                  {isScheduled && (
                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-3 animate-in fade-in">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-300 font-medium mb-1">
                            প্রকাশের তারিখ ও সময় (Scheduled Date & Time) *
                          </label>
                          <input
                            type="datetime-local"
                            value={formData.scheduled_at}
                            onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 focus:border-emerald-500 focus:outline-none font-mono"
                            required={isScheduled}
                          />
                        </div>

                        <div className="flex flex-col justify-end">
                          <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-slate-950 border border-slate-800/80">
                            <input
                              type="checkbox"
                              checked={formData.show_as_upcoming}
                              onChange={(e) => setFormData({ ...formData, show_as_upcoming: e.target.checked })}
                              className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                            />
                            <div className="text-xs">
                              <span className="font-bold text-emerald-300 block">
                                অ্যাপে 'আপকামিং' হিসেবে কাউন্টডাউন দেখাবে?
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                (নির্ধারিত সময়ের পূর্বে অ্যাপে কাউন্টডাউন টাইমার দেখাবে)
                              </span>
                            </div>
                          </label>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400 inline mr-1" />
                        <strong>নোট:</strong> সময় আসার পূর্বে ড্রাফট করে রাখলে পরীক্ষাটি অ্যাপে দেখাবে না। পাবলিশড রাখা অবস্থায় অগ্রীম সময় দিলে অটোমেটিক নির্দিষ্ট সময়ে শিক্ষার্থীদের জন্য পরীক্ষাটি আনলক হয়ে যাবে।
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* QUESTION SELECTION MANAGER */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-white">
                    মডেল টেস্টের অন্তর্ভুক্ত প্রশ্নসমূহ ({formData.question_ids.length}টি প্রশ্ন সিলেক্টেড)
                  </label>
                  <span className="text-[11px] text-slate-400">মাস্টার প্রশ্ন ব্যাংক থেকে নির্বাচন করুন</span>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                  {questions.map((q) => {
                    const isSelected = formData.question_ids.includes(q.id);
                    const selectedIdx = formData.question_ids.indexOf(q.id);

                    return (
                      <div
                        key={q.id}
                        className={`p-3 rounded-xl border flex items-start gap-3 transition-all ${
                          isSelected
                            ? 'bg-emerald-950/40 border-emerald-700 text-emerald-100'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleQuestionInTest(q.id)}
                          className="mt-1 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                        />

                        <div className="flex-1 text-xs">
                          <p className="font-medium">{q.question_bn}</p>
                          {q.question_ar && (
                            <p className="font-serif text-amber-300 mt-0.5 text-right font-semibold" dir="rtl">
                              {q.question_ar}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                            <span>{q.subject}</span> &bull; <span>{q.difficulty}</span>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900 text-emerald-300 font-bold">
                              #{selectedIdx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleMoveQuestion(selectedIdx, 'up')}
                              disabled={selectedIdx === 0}
                              className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30"
                            >
                              <MoveUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveQuestion(selectedIdx, 'down')}
                              disabled={selectedIdx === formData.question_ids.length - 1}
                              className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30"
                            >
                              <MoveDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors"
                >
                  বাতিল (Cancel)
                </button>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => handleSaveWithStatus(false)}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-semibold text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <FileEdit className="w-4 h-4 text-amber-400" />
                    <span>ড্রাফট সেভ করুন (App Hidden)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveWithStatus(true)}
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/80 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Globe className="w-4 h-4 text-emerald-200" />
                    <span>পাবলিশ ও লাইভ করুন</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW MODEL TEST MODAL */}
      {previewTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
            <button
              onClick={() => setPreviewTest(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                  {previewTest.subject}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {toBengaliDigits(previewTest.question_ids?.length || 0)}টি প্রশ্ন &bull; {toBengaliDigits(previewTest.duration_minutes)} মিনিট
                </span>
              </div>
              <h3 className="text-xl font-bold text-white font-serif mt-2">{previewTest.title}</h3>
              {previewTest.subtitle && <p className="text-xs text-slate-400 mt-0.5">{previewTest.subtitle}</p>}
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-xs text-slate-300 uppercase tracking-wider">
                পরীক্ষার অন্তর্ভুক্ত প্রশ্নসমূহ ({toBengaliDigits(previewTest.question_ids?.length || 0)}টি MCQ):
              </h4>

              {previewTest.question_ids?.map((qId, idx) => {
                const q = questions.find((item) => item.id === qId);
                if (!q) return null;
                return (
                  <div key={qId} className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-emerald-400">প্রশ্ন {toBengaliDigits(idx + 1)}.</span>
                      <span className="text-[10px] text-slate-500 font-mono">{q.difficulty}</span>
                    </div>

                    <p className="font-medium text-slate-100">{q.question_bn}</p>
                    {q.question_ar && (
                      <p className="font-serif text-amber-300 text-right text-sm leading-relaxed" dir="rtl">
                        {q.question_ar}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`p-2 rounded-lg border text-xs ${
                            oIdx === q.correct_option
                              ? 'bg-emerald-950/60 border-emerald-600 text-emerald-200 font-semibold'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          <span className="font-bold mr-1">{['ক', 'খ', 'গ', 'ঘ'][oIdx]}.</span>
                          {opt}
                        </div>
                      ))}
                    </div>

                    {q.explanation && (
                      <div className="mt-2 p-2.5 bg-slate-900 rounded-lg text-[11px] text-slate-300 border border-slate-800/80">
                        <span className="font-semibold text-emerald-400">ব্যাখ্যা: </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* LIVE STUDENT EXAM RUNNER MODAL */}
      {activeExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl relative max-h-[92vh] flex flex-col justify-between">
            {/* Top Bar / Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4 shrink-0">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {activeExam.subject} &bull; {activeExam.cadre_tier}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white font-serif mt-1">{activeExam.title}</h3>
              </div>

              <div className="flex items-center gap-3">
                {!examSubmitted && (
                  <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl font-mono text-xs sm:text-sm font-bold text-amber-400 flex items-center gap-1.5 shadow-inner">
                    <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>
                      {toBengaliDigits(Math.floor(examTimeLeft / 60))}:
                      {toBengaliDigits(String(examTimeLeft % 60).padStart(2, '0'))}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => setActiveExam(null)}
                  className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {!examSubmitted ? (
                <div className="space-y-4">
                  {/* Progress Tracker */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs text-slate-300 font-mono">
                    <span>
                      উত্তর প্রদান করেছেন: <strong className="text-emerald-400">{toBengaliDigits(Object.keys(userAnswers).length)}</strong> / {toBengaliDigits(activeExam.question_ids?.length || 0)}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      নেগেটিভ মার্কিং: {activeExam.negative_marking ? 'সক্রিয় (-0.25)' : 'নিষ্ক্রিয়'}
                    </span>
                  </div>

                  {activeExam.question_ids?.map((qId, qIdx) => {
                    const q = questions.find((item) => item.id === qId);
                    if (!q) return null;
                    const selectedOpt = userAnswers[qId];

                    return (
                      <div key={qId} className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl text-xs space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-emerald-400 text-sm">
                            প্রশ্ন {toBengaliDigits(qIdx + 1)}.
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">১ মার্ক</span>
                        </div>

                        <p className="font-medium text-slate-100 text-sm leading-relaxed">{q.question_bn}</p>
                        {q.question_ar && (
                          <p className="font-serif text-amber-300 text-right text-base leading-relaxed" dir="rtl">
                            {q.question_ar}
                          </p>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {q.options.map((opt, oIdx) => {
                            const isChosen = selectedOpt === oIdx;
                            return (
                              <button
                                key={oIdx}
                                type="button"
                                onClick={() => setUserAnswers((prev) => ({ ...prev, [qId]: oIdx }))}
                                className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center gap-2 ${
                                  isChosen
                                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-semibold shadow-md ring-1 ring-emerald-500/50'
                                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                                }`}
                              >
                                <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                  isChosen ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'border-slate-700 text-slate-400'
                                }`}>
                                  {['ক', 'খ', 'গ', 'ঘ'][oIdx]}
                                </span>
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* EXAM RESULT SCOREBOARD */
                <div className="space-y-6 animate-in fade-in">
                  {(() => {
                    const totalQ = activeExam.question_ids?.length || 0;
                    let correctCount = 0;
                    let incorrectCount = 0;

                    activeExam.question_ids?.forEach((qId) => {
                      const q = questions.find((item) => item.id === qId);
                      if (!q) return;
                      const ans = userAnswers[qId];
                      if (ans === undefined) return;
                      if (ans === q.correct_option) correctCount++;
                      else incorrectCount++;
                    });

                    const penalty = activeExam.negative_marking ? incorrectCount * 0.25 : 0;
                    const markPerQ = totalQ > 0 ? activeExam.total_marks / totalQ : 1;
                    const obtainedMarks = Math.max(0, correctCount * markPerQ - penalty);
                    const isPassed = obtainedMarks >= activeExam.pass_mark;

                    return (
                      <div className="space-y-6">
                        {/* Result Hero */}
                        <div className={`p-6 rounded-2xl border text-center space-y-3 ${
                          isPassed
                            ? 'bg-emerald-950/50 border-emerald-700/80 text-emerald-100'
                            : 'bg-rose-950/50 border-rose-800/80 text-rose-100'
                        }`}>
                          <div className="inline-flex p-3 rounded-full bg-slate-900 border border-slate-700 mb-1">
                            {isPassed ? (
                              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                            ) : (
                              <XCircle className="w-8 h-8 text-rose-400" />
                            )}
                          </div>
                          <h4 className="text-2xl font-bold font-serif">
                            {isPassed ? 'অভিনন্দন! আপনি পরীক্ষায় উত্তীর্ণ হয়েছেন!' : 'দুঃখিত! আরও অনুশিলনের প্রয়োজন।'}
                          </h4>
                          <p className="text-xs text-slate-300">
                            পাস মার্কস: {toBengaliDigits(activeExam.pass_mark)} | মোট মার্কস: {toBengaliDigits(activeExam.total_marks)}
                          </p>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/60 font-mono text-xs">
                            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                              <span className="text-[10px] text-slate-400 block">প্রাপ্ত নম্বর</span>
                              <strong className="text-base text-emerald-400">{toBengaliDigits(obtainedMarks.toFixed(2))}</strong>
                            </div>
                            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                              <span className="text-[10px] text-slate-400 block">সঠিক উত্তর</span>
                              <strong className="text-base text-emerald-300">{toBengaliDigits(correctCount)}টি</strong>
                            </div>
                            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                              <span className="text-[10px] text-slate-400 block">ভুল উত্তর (-0.25)</span>
                              <strong className="text-base text-rose-400">{toBengaliDigits(incorrectCount)}টি</strong>
                            </div>
                            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                              <span className="text-[10px] text-slate-400 block">অনুত্তরিত</span>
                              <strong className="text-base text-slate-400">{toBengaliDigits(totalQ - (correctCount + incorrectCount))}টি</strong>
                            </div>
                          </div>
                        </div>

                        {/* Detailed Solutions Review */}
                        <div className="space-y-4">
                          <h4 className="font-bold text-sm text-white font-serif border-b border-slate-800 pb-2">
                            প্রশ্নের সঠিক উত্তর ও উত্তর বিশ্লেষণ:
                          </h4>

                          {activeExam.question_ids?.map((qId, idx) => {
                            const q = questions.find((item) => item.id === qId);
                            if (!q) return null;
                            const userAns = userAnswers[qId];
                            const isCorrect = userAns === q.correct_option;

                            return (
                              <div
                                key={qId}
                                className={`p-4 rounded-xl border text-xs space-y-2 ${
                                  userAns === undefined
                                    ? 'bg-slate-950 border-slate-800'
                                    : isCorrect
                                    ? 'bg-emerald-950/30 border-emerald-800/60'
                                    : 'bg-rose-950/30 border-rose-900/60'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-200">প্রশ্ন {toBengaliDigits(idx + 1)}. {q.question_bn}</span>
                                  {userAns !== undefined && (
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                                      isCorrect ? 'bg-emerald-900 text-emerald-300' : 'bg-rose-900 text-rose-300'
                                    }`}>
                                      {isCorrect ? 'সঠিক (+১)' : 'ভুল (-০.২৫)'}
                                    </span>
                                  )}
                                </div>

                                <div className="grid grid-cols-2 gap-2 pt-2">
                                  {q.options.map((opt, oIdx) => {
                                    const isTargetCorrect = oIdx === q.correct_option;
                                    const isUserPick = oIdx === userAns;

                                    return (
                                      <div
                                        key={oIdx}
                                        className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                                          isTargetCorrect
                                            ? 'bg-emerald-900/60 border-emerald-600 text-emerald-200 font-semibold'
                                            : isUserPick
                                            ? 'bg-rose-900/60 border-rose-600 text-rose-200 font-semibold'
                                            : 'bg-slate-900 border-slate-800 text-slate-400'
                                        }`}
                                      >
                                        <span><strong className="mr-1">{['ক', 'খ', 'গ', 'ঘ'][oIdx]}.</strong> {opt}</span>
                                        {isTargetCorrect && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                                      </div>
                                    );
                                  })}
                                </div>

                                {q.explanation && (
                                  <div className="p-2.5 bg-slate-900/90 rounded-lg text-[11px] text-slate-300 border border-slate-800/80 mt-2">
                                    <strong className="text-emerald-400">ব্যাখ্যা: </strong>{q.explanation}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Bottom Modal Actions */}
            <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setActiveExam(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                বন্ধ করুন
              </button>

              {!examSubmitted ? (
                <button
                  type="button"
                  onClick={() => setExamSubmitted(true)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-950/80 flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>পরীক্ষা জমা দিন (Submit Exam)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleStartLiveExam(activeExam)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>পুনরায় চেষ্টা করুন</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

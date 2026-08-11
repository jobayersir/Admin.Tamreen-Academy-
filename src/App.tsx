import React, { useState, useEffect } from 'react';
import { Sidebar, TabId } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { ToastProvider, useToast } from './components/Toast';
import { SupabaseSetupModal } from './components/SupabaseSetupModal';
import { PaymentModal } from './components/PaymentModal';

// Tabs
import { DashboardTab } from './components/tabs/DashboardTab';
import { ModelTestsTab } from './components/tabs/ModelTestsTab';
import { CoursesTab } from './components/tabs/CoursesTab';
import { QuestionBankTab } from './components/tabs/QuestionBankTab';
import { AIGeneratorTab } from './components/tabs/AIGeneratorTab';
import { WrittenExamsTab } from './components/tabs/WrittenExamsTab';
import { GlossaryResourcesTab } from './components/tabs/GlossaryResourcesTab';
import { UsersSubscriptionsTab } from './components/tabs/UsersSubscriptionsTab';

// Storage Layer
import {
  checkSupabaseConnection,
  getQuestions,
  saveQuestion,
  deleteQuestion,
  bulkSaveQuestions,
  getModelTests,
  saveModelTest,
  deleteModelTest,
  getCourses,
  saveCourse,
  getWrittenQuestions,
  saveWrittenQuestion,
  getGlossaryTerms,
  saveGlossaryTerm,
  deleteGlossaryTerm,
  getLectureSheets,
  saveLectureSheet,
  deleteLectureSheet,
  getUsers,
  toggleUserVip,
  getLocal,
  STORAGE_KEYS
} from './lib/supabase';
import {
  INITIAL_QUESTIONS,
  INITIAL_MODEL_TESTS,
  INITIAL_COURSES,
  INITIAL_WRITTEN_QUESTIONS,
  INITIAL_GLOSSARY,
  INITIAL_RESOURCES,
  INITIAL_USERS
} from './lib/initialData';

import {
  Question,
  ModelTest,
  Course,
  WrittenQuestion,
  GlossaryTerm,
  LectureSheet,
  UserProfile,
  Subject,
  CadreTier,
  Difficulty,
  PaymentTransaction
} from './types';
import { Database, Plus, X, CreditCard } from 'lucide-react';

const AdminAppContent: React.FC = () => {
  const { showToast } = useToast();

  // Layout & Theme State
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Custom Subjects State
  const [customSubjects, setCustomSubjects] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tamreen_custom_subjects');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleAddCustomSubject = (newSubject: string) => {
    if (!newSubject.trim()) return;
    setCustomSubjects((prev) => {
      if (prev.includes(newSubject)) return prev;
      const updated = [...prev, newSubject];
      localStorage.setItem('tamreen_custom_subjects', JSON.stringify(updated));
      return updated;
    });
    showToast('Subject Added', `"${newSubject}" নতুন বিষয় হিসেবে যুক্ত হয়েছে।`, 'success');
  };

  // Data Collections State (Instant Local-First Initialization for zero mobile data loading lag)
  const [questions, setQuestions] = useState<Question[]>(() => getLocal<Question>(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS));
  const [modelTests, setModelTests] = useState<ModelTest[]>(() => getLocal<ModelTest>(STORAGE_KEYS.MODEL_TESTS, INITIAL_MODEL_TESTS));
  const [courses, setCourses] = useState<Course[]>(() => getLocal<Course>(STORAGE_KEYS.COURSES, INITIAL_COURSES));
  const [writtenQuestions, setWrittenQuestions] = useState<WrittenQuestion[]>(() => getLocal<WrittenQuestion>(STORAGE_KEYS.WRITTEN, INITIAL_WRITTEN_QUESTIONS));
  const [glossaryTerms, setGlossaryTerms] = useState<GlossaryTerm[]>(() => getLocal<GlossaryTerm>(STORAGE_KEYS.GLOSSARY, INITIAL_GLOSSARY));
  const [lectureSheets, setLectureSheets] = useState<LectureSheet[]>(() => getLocal<LectureSheet>(STORAGE_KEYS.RESOURCES, INITIAL_RESOURCES));
  const [users, setUsers] = useState<UserProfile[]>(() => getLocal<UserProfile>(STORAGE_KEYS.USERS, INITIAL_USERS));
  const [isLoading, setIsLoading] = useState(false);

  // Quick MCQ Modal State (for TopBar or Dashboard trigger)
  const [isQuickMcqOpen, setIsQuickMcqOpen] = useState(false);
  const [quickMcqData, setQuickMcqData] = useState({
    question_bn: '',
    question_ar: '',
    option_0: '',
    option_1: '',
    option_2: '',
    option_3: '',
    correct_option: 0,
    explanation: '',
    subject: 'বালাগাত ও মানতিক' as Subject,
    cadre_tier: 'প্রভাষক (আরবি)' as CadreTier,
    difficulty: 'মাঝারি' as Difficulty
  });

  // Load Initial Data & Background Sync
  const loadAllData = async () => {
    try {
      // Check Supabase connection in parallel non-blocking
      checkSupabaseConnection()
        .then((dbStatus) => setIsSupabaseConnected(dbStatus))
        .catch(() => setIsSupabaseConnected(false));

      // Fetch all collections in parallel with fallbacks
      const [q, m, c, w, g, l, u] = await Promise.all([
        getQuestions().catch(() => getLocal<Question>(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS)),
        getModelTests().catch(() => getLocal<ModelTest>(STORAGE_KEYS.MODEL_TESTS, INITIAL_MODEL_TESTS)),
        getCourses().catch(() => getLocal<Course>(STORAGE_KEYS.COURSES, INITIAL_COURSES)),
        getWrittenQuestions().catch(() => getLocal<WrittenQuestion>(STORAGE_KEYS.WRITTEN, INITIAL_WRITTEN_QUESTIONS)),
        getGlossaryTerms().catch(() => getLocal<GlossaryTerm>(STORAGE_KEYS.GLOSSARY, INITIAL_GLOSSARY)),
        getLectureSheets().catch(() => getLocal<LectureSheet>(STORAGE_KEYS.RESOURCES, INITIAL_RESOURCES)),
        getUsers().catch(() => getLocal<UserProfile>(STORAGE_KEYS.USERS, INITIAL_USERS))
      ]);

      if (q && q.length > 0) setQuestions(q);
      if (m && m.length > 0) setModelTests(m);
      if (c && c.length > 0) setCourses(c);
      if (w && w.length > 0) setWrittenQuestions(w);
      if (g && g.length > 0) setGlossaryTerms(g);
      if (l && l.length > 0) setLectureSheets(l);
      if (u && u.length > 0) setUsers(u);
    } catch (err: any) {
      console.warn('Background sync failed, using offline cache:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();

    const handleNetworkChange = () => {
      if (navigator.onLine) {
        loadAllData();
      }
    };

    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);
    window.addEventListener('focus', handleNetworkChange);

    return () => {
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
      window.removeEventListener('focus', handleNetworkChange);
    };
  }, []);

  // Sync dark mode class on root body
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Handlers for Questions
  const handleSaveQuestion = async (qData: Omit<Question, 'id' | 'created_at'> & { id?: string }) => {
    const saved = await saveQuestion(qData);
    setQuestions((prev) => {
      const exists = prev.some((item) => item.id === saved.id);
      if (exists) return prev.map((item) => (item.id === saved.id ? saved : item));
      return [saved, ...prev];
    });
  };

  const handleDeleteQuestion = async (id: string) => {
    await deleteQuestion(id);
    setQuestions((prev) => prev.filter((item) => item.id !== id));
  };

  const handleBulkAddQuestions = async (items: Omit<Question, 'id' | 'created_at'>[]) => {
    const savedList = await bulkSaveQuestions(items);
    setQuestions((prev) => [...savedList, ...prev]);
  };

  // Handlers for Model Tests
  const handleSaveModelTest = async (testData: Omit<ModelTest, 'id' | 'created_at'> & { id?: string }) => {
    const saved = await saveModelTest(testData);
    setModelTests((prev) => {
      const exists = prev.some((item) => item.id === saved.id);
      if (exists) return prev.map((item) => (item.id === saved.id ? saved : item));
      return [saved, ...prev];
    });
    return saved;
  };

  const handleDeleteModelTest = async (id: string) => {
    await deleteModelTest(id);
    setModelTests((prev) => prev.filter((item) => item.id !== id));
  };

  // Handlers for Courses
  const handleSaveCourse = async (courseData: Omit<Course, 'id' | 'created_at'> & { id?: string }) => {
    const saved = await saveCourse(courseData);
    setCourses((prev) => {
      const exists = prev.some((item) => item.id === saved.id);
      if (exists) return prev.map((item) => (item.id === saved.id ? saved : item));
      return [saved, ...prev];
    });
  };

  // Handlers for Written Questions
  const handleSaveWrittenQuestion = async (wqData: Omit<WrittenQuestion, 'id' | 'created_at'> & { id?: string }) => {
    const saved = await saveWrittenQuestion(wqData);
    setWrittenQuestions((prev) => {
      const exists = prev.some((item) => item.id === saved.id);
      if (exists) return prev.map((item) => (item.id === saved.id ? saved : item));
      return [saved, ...prev];
    });
  };

  // Handlers for Glossary
  const handleSaveGlossaryTerm = async (gData: Omit<GlossaryTerm, 'id' | 'created_at'> & { id?: string }) => {
    const saved = await saveGlossaryTerm(gData);
    setGlossaryTerms((prev) => {
      const exists = prev.some((item) => item.id === saved.id);
      if (exists) return prev.map((item) => (item.id === saved.id ? saved : item));
      return [saved, ...prev];
    });
  };

  const handleDeleteGlossaryTerm = async (id: string) => {
    await deleteGlossaryTerm(id);
    setGlossaryTerms((prev) => prev.filter((item) => item.id !== id));
  };

  // Handlers for Lecture Sheets
  const handleSaveLectureSheet = async (lsData: Omit<LectureSheet, 'id' | 'created_at'> & { id?: string }) => {
    const saved = await saveLectureSheet(lsData);
    setLectureSheets((prev) => {
      const exists = prev.some((item) => item.id === saved.id);
      if (exists) return prev.map((item) => (item.id === saved.id ? saved : item));
      return [saved, ...prev];
    });
  };

  const handleDeleteLectureSheet = async (id: string) => {
    await deleteLectureSheet(id);
    setLectureSheets((prev) => prev.filter((item) => item.id !== id));
  };

  // Handlers for Users & VIP
  const handleToggleUserVip = async (userId: string, currentVip: boolean) => {
    const updated = await toggleUserVip(userId, currentVip);
    setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
  };

  // Submit Quick MCQ
  const handleQuickMcqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickMcqData.question_bn || !quickMcqData.option_0 || !quickMcqData.option_1) {
      showToast('Error', 'প্রশ্ন ও প্রয়োজনীয় অপশনসমূহ টাইপ করুন', 'error');
      return;
    }

    try {
      await handleSaveQuestion({
        question_bn: quickMcqData.question_bn,
        question_ar: quickMcqData.question_ar || undefined,
        options: [quickMcqData.option_0, quickMcqData.option_1, quickMcqData.option_2, quickMcqData.option_3],
        correct_option: Number(quickMcqData.correct_option),
        explanation: quickMcqData.explanation,
        subject: quickMcqData.subject,
        topic: 'সাধারণ',
        cadre_tier: quickMcqData.cadre_tier,
        difficulty: quickMcqData.difficulty,
        usage_count: 0
      });

      showToast('MCQ Added', 'প্রশ্নটি নতুনভাবে মাস্টার প্রশ্ন ব্যাংকে যুক্ত করা হয়েছে!', 'success');
      setIsQuickMcqOpen(false);
      setQuickMcqData({
        ...quickMcqData,
        question_bn: '',
        question_ar: '',
        option_0: '',
        option_1: '',
        option_2: '',
        option_3: '',
        explanation: ''
      });
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  return (
    <div className={`min-h-screen font-sans ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} transition-colors`}>
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        questionCount={questions.length}
        modelTestCount={modelTests.length}
      />

      {/* Main Layout Area */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        {/* Top Header Controls */}
        <TopBar
          onOpenSidebar={() => setIsSidebarOpen(true)}
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setIsSidebarOpen(false);
          }}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          isSupabaseConnected={isSupabaseConnected}
          onOpenSupabaseModal={() => setIsSetupModalOpen(true)}
          onQuickAddMCQ={() => setIsQuickMcqOpen(true)}
          onOpenPayments={() => setIsPaymentModalOpen(true)}
        />

        {/* Tab View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-mono">তামরীন একাডেমি সিস্টেম লোড হচ্ছে...</p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardTab
                  questions={questions}
                  modelTests={modelTests}
                  courses={courses}
                  users={users}
                  setActiveTab={setActiveTab}
                  onOpenQuickAddMCQ={() => setIsQuickMcqOpen(true)}
                />
              )}

              {activeTab === 'model_tests' && (
                <ModelTestsTab
                  modelTests={modelTests}
                  questions={questions}
                  onSaveModelTest={handleSaveModelTest}
                  onDeleteModelTest={handleDeleteModelTest}
                />
              )}

              {activeTab === 'courses' && (
                <CoursesTab
                  courses={courses}
                  masterQuestions={questions}
                  customSubjects={customSubjects}
                  onAddCustomSubject={handleAddCustomSubject}
                  onSaveCourse={handleSaveCourse}
                />
              )}

              {activeTab === 'question_bank' && (
                <QuestionBankTab
                  questions={questions}
                  customSubjects={customSubjects}
                  onAddCustomSubject={handleAddCustomSubject}
                  onSaveQuestion={handleSaveQuestion}
                  onDeleteQuestion={handleDeleteQuestion}
                  onSwitchTab={setActiveTab}
                />
              )}

              {activeTab === 'ai_hub' && (
                <AIGeneratorTab
                  onBulkAddQuestions={handleBulkAddQuestions}
                  onAddSingleQuestion={handleSaveQuestion}
                  customSubjects={customSubjects}
                  onAddCustomSubject={handleAddCustomSubject}
                />
              )}

              {activeTab === 'written_exams' && (
                <WrittenExamsTab
                  writtenQuestions={writtenQuestions}
                  onSaveWrittenQuestion={handleSaveWrittenQuestion}
                />
              )}

              {activeTab === 'glossary_resources' && (
                <GlossaryResourcesTab
                  glossaryTerms={glossaryTerms}
                  lectureSheets={lectureSheets}
                  onSaveGlossaryTerm={handleSaveGlossaryTerm}
                  onDeleteGlossaryTerm={handleDeleteGlossaryTerm}
                  onSaveLectureSheet={handleSaveLectureSheet}
                  onDeleteLectureSheet={handleDeleteLectureSheet}
                />
              )}

              {activeTab === 'users' && (
                <UsersSubscriptionsTab
                  users={users}
                  onToggleVip={handleToggleUserVip}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Supabase DDL Setup Guide Modal */}
      <SupabaseSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        isConnected={isSupabaseConnected}
      />

      {/* QUICK ADD MCQ MODAL */}
      {isQuickMcqOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsQuickMcqOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white font-serif flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              দ্রুত নতুন MCQ যুক্ত করুন
            </h3>

            <form onSubmit={handleQuickMcqSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">বিষয় (Subject)</label>
                  <select
                    value={quickMcqData.subject}
                    onChange={(e) => setQuickMcqData({ ...quickMcqData, subject: e.target.value as Subject })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="বালাগাত ও মানতিক">বালাগাত ও মানতিক</option>
                    <option value="আল-কুরআন">আল-কুরআন</option>
                    <option value="হাদিস">হাদিস</option>
                    <option value="ফিকহ্ ও উসুল">ফিকহ্ ও উসুল</option>
                    <option value="বাংলা">বাংলা</option>
                    <option value="ইংরেজি">ইংরেজি</option>
                    <option value="আইসিটি ও সাধারণ জ্ঞান">আইসিটি ও সাধারণ জ্ঞান</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">ক্যাডার টার্গেট</label>
                  <select
                    value={quickMcqData.cadre_tier}
                    onChange={(e) => setQuickMcqData({ ...quickMcqData, cadre_tier: e.target.value as CadreTier })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="প্রভাষক (আরবি)">প্রভাষক (আরবি)</option>
                    <option value="সহকারী শিক্ষক (আরবি)">সহকারী শিক্ষক (আরবি)</option>
                    <option value="সহকারী মৌলভী">সহকারী মৌলভী</option>
                    <option value="ইবতেদায়ী প্রধান">ইবতেদায়ী প্রধান</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">প্রশ্ন বাংলা টেক্সট *</label>
                <textarea
                  rows={2}
                  value={quickMcqData.question_bn}
                  onChange={(e) => setQuickMcqData({ ...quickMcqData, question_bn: e.target.value })}
                  placeholder="যেমন: ফিকহ্ শাস্ত্রের মৌলিক উসুল কয়টি?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">প্রশ্ন আরবি টেক্সট (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={quickMcqData.question_ar}
                  onChange={(e) => setQuickMcqData({ ...quickMcqData, question_ar: e.target.value })}
                  placeholder="যেমন: كم أصلا للفقه؟"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-amber-300 font-serif focus:border-emerald-500 focus:outline-none text-right"
                  dir="rtl"
                />
              </div>

              {/* 4 options */}
              <div className="space-y-2">
                <label className="block text-slate-300 font-medium">৪টি অপশন ও সঠিক উত্তর *</label>
                <div className="grid grid-cols-2 gap-2">
                  {[0, 1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-xl border flex items-center gap-2 ${
                        quickMcqData.correct_option === idx
                          ? 'bg-emerald-950/60 border-emerald-600'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <input
                        type="radio"
                        name="quick_correct"
                        checked={quickMcqData.correct_option === idx}
                        onChange={() => setQuickMcqData({ ...quickMcqData, correct_option: idx })}
                      />
                      <span className="font-bold text-slate-400">{['ক', 'খ', 'গ', 'ঘ'][idx]}.</span>
                      <input
                        type="text"
                        value={
                          idx === 0
                            ? quickMcqData.option_0
                            : idx === 1
                            ? quickMcqData.option_1
                            : idx === 2
                            ? quickMcqData.option_2
                            : quickMcqData.option_3
                        }
                        onChange={(e) => {
                          const v = e.target.value;
                          if (idx === 0) setQuickMcqData({ ...quickMcqData, option_0: v });
                          else if (idx === 1) setQuickMcqData({ ...quickMcqData, option_1: v });
                          else if (idx === 2) setQuickMcqData({ ...quickMcqData, option_2: v });
                          else setQuickMcqData({ ...quickMcqData, option_3: v });
                        }}
                        placeholder={`অপশন ${['ক', 'খ', 'গ', 'ঘ'][idx]}`}
                        className="w-full bg-transparent text-slate-100 text-xs focus:outline-none"
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">ব্যাখ্যা</label>
                <textarea
                  rows={2}
                  value={quickMcqData.explanation}
                  onChange={(e) => setQuickMcqData({ ...quickMcqData, explanation: e.target.value })}
                  placeholder="ব্যাখ্যা লিখুন..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsQuickMcqOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-semibold shadow-md"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* PAYMENT TRANSACTION & VIP MODAL */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        users={users}
        onToggleVip={handleToggleUserVip}
      />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AdminAppContent />
    </ToastProvider>
  );
}

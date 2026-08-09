import React, { useState } from 'react';
import {
  FileCheck2,
  Plus,
  Search,
  Filter,
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
  ChevronRight,
  X
} from 'lucide-react';
import { ModelTest, Question, Subject, CadreTier } from '../../types';
import { useToast } from '../Toast';

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
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

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

  // Question selection filter inside create modal
  const [modalQuestionSearch, setModalQuestionSearch] = useState('');
  const [modalQuestionSubjectFilter, setModalQuestionSubjectFilter] = useState('All');

  // Timer Effect for Live Exam
  React.useEffect(() => {
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

  // Filter Logic
  const filteredTests = modelTests.filter((test) => {
    const matchesSearch =
      test.title.toLowerCase().includes(search.toLowerCase()) ||
      test.subtitle.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = selectedSubject === 'All' || test.subject === selectedSubject;
    const matchesStatus =
      selectedStatus === 'All' ||
      (selectedStatus === 'Published' && test.is_published) ||
      (selectedStatus === 'Draft' && !test.is_published) ||
      (selectedStatus === 'VIP' && test.is_premium) ||
      (selectedStatus === 'Free' && !test.is_premium);

    return matchesSearch && matchesSubject && matchesStatus;
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
      question_ids: questions.slice(0, 3).map((q) => q.id)
    });
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
      question_ids: test.question_ids || []
    });
    setEditingTest(test);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Error', 'মডেল টেস্ট শিরোনাম টাইপ করুন', 'error');
      return;
    }

    try {
      await onSaveModelTest({
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
        is_published: formData.is_published,
        question_ids: formData.question_ids
      });

      showToast(
        editingTest ? 'Model Test Updated' : 'Model Test Created',
        `"${formData.title}" সফলভাবে সংরক্ষিত হয়েছে।`,
        'success'
      );
      setIsModalOpen(false);
    } catch (err: any) {
      showToast('Save Failed', err.message, 'error');
    }
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
        test.is_published ? 'Unpublished' : 'Published',
        `"${test.title}" স্ট্যাটাস পরিবর্তন করা হয়েছে।`,
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

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white font-serif flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-emerald-400" />
            মডেল টেস্ট ও ফ্রি পরীক্ষা ব্যবস্থাপনা
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            NTRCA ক্যাডার ভিত্তিক মডেল টেস্ট তৈরি, নেগেটিভ মার্কিং সেটআপ ও প্রশ্ন বিন্যাস।
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন মডেল টেস্ট তৈরি</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="মডেল টেস্ট খুঁজুন..."
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
          <option value="Published">পাবলিশড (Published)</option>
          <option value="Draft">ড্রাফট (Draft)</option>
          <option value="VIP">ভিআইপি প্রিমিয়াম (VIP Only)</option>
          <option value="Free">ফ্রি এক্সেস (Free Test)</option>
        </select>
      </div>

      {/* Model Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTests.map((test) => {
          const qCount = test.question_ids?.length || 0;
          return (
            <div
              key={test.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md group relative overflow-hidden"
            >
              <div className="space-y-3">
                {/* Badges */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700 font-medium">
                    {test.subject}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {test.is_premium ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-amber-400" />
                        VIP Premium
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-medium">
                        Free Test
                      </span>
                    )}

                    <button
                      onClick={() => handleTogglePublish(test)}
                      className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                        test.is_published
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                      title="Click to Toggle Publish/Unpublish"
                    >
                      {test.is_published ? 'Published' : 'Draft'}
                    </button>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-base font-bold text-white font-serif leading-snug group-hover:text-emerald-300 transition-colors">
                    {test.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {test.subtitle}
                  </p>
                </div>

                {/* Metrics Meta */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-300 font-mono">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{test.duration_minutes} মিনিট</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-slate-400" />
                    <span>{test.total_marks} মার্কস</span>
                  </div>
                  <div className="flex items-center gap-1 justify-end">
                    <span className="text-emerald-400 font-bold">{qCount}টি MCQ</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800/80 gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartLiveExam(test)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1 transition-all shadow-md active:scale-95"
                    title="পরীক্ষার্থী মোডে সরাসরি পরীক্ষা দিন"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>পরীক্ষা দিন</span>
                  </button>

                  <button
                    onClick={() => setPreviewTest(test)}
                    className="text-xs text-slate-300 hover:text-emerald-400 flex items-center gap-1 font-medium transition-colors px-2 py-1 rounded-lg hover:bg-slate-800"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>পূর্বরূপ</span>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(test)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Edit Model Test"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(test.id, test.title)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                    title="Delete Model Test"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTests.length === 0 && (
        <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-sm">
          কোনো মডেল টেস্ট পাওয়া যায়নি। নতুন মডেল টেস্ট তৈরি করতে "নতুন মডেল টেস্ট তৈরি" বাটনে ক্লিক করুন।
        </div>
      )}

      {/* CREATE / EDIT MODEL TEST MODAL */}
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
                  <label className="block text-slate-300 font-medium mb-1">সময় (মিনিট)</label>
                  <input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">মোট মার্কস</label>
                  <input
                    type="number"
                    value={formData.total_marks}
                    onChange={(e) => setFormData({ ...formData, total_marks: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">পাস মার্কস</label>
                  <input
                    type="number"
                    value={formData.pass_mark}
                    onChange={(e) => setFormData({ ...formData, pass_mark: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-6 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.negative_marking}
                    onChange={(e) => setFormData({ ...formData, negative_marking: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>নেগেটিভ মার্কিং (0.25 মার্ক কাটা যাবে)</span>
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

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>সরাসরি পাবলিশ করুন</span>
                </label>
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
                  {questions.map((q, idx) => {
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

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md"
                >
                  সংরক্ষণ করুন
                </button>
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
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                {previewTest.subject}
              </span>
              <h3 className="text-xl font-bold text-white font-serif mt-2">{previewTest.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{previewTest.subtitle}</p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-xs text-slate-300 uppercase tracking-wider">
                পরীক্ষার প্রশ্নসমূহ ({previewTest.question_ids?.length || 0}টি MCQ):
              </h4>

              {previewTest.question_ids?.map((qId, idx) => {
                const q = questions.find((item) => item.id === qId);
                if (!q) return null;
                return (
                  <div key={qId} className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-emerald-400">প্রশ্ন {idx + 1}.</span>
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

                    <div className="mt-2 p-2.5 bg-slate-900 rounded-lg text-[11px] text-slate-300 border border-slate-800/80">
                      <span className="font-semibold text-emerald-400">ব্যাখ্যা: </span>
                      {q.explanation}
                    </div>
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
                      {Math.floor(examTimeLeft / 60)}:
                      {String(examTimeLeft % 60).padStart(2, '0')}
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
              {/* Question List or Result Screen */}
              {!examSubmitted ? (
                <div className="space-y-4">
                  {/* Progress Tracker */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs text-slate-300 font-mono">
                    <span>
                      উত্তর প্রদান করেছেন: <strong className="text-emerald-400">{Object.keys(userAnswers).length}</strong> / {activeExam.question_ids?.length || 0}
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
                            প্রশ্ন {qIdx + 1}.
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
                            পাস মার্কস: {activeExam.pass_mark} | মোট মার্কস: {activeExam.total_marks}
                          </p>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/60 font-mono text-xs">
                            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                              <span className="text-[10px] text-slate-400 block">প্রাপ্ত নম্বর</span>
                              <strong className="text-base text-emerald-400">{obtainedMarks.toFixed(2)}</strong>
                            </div>
                            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                              <span className="text-[10px] text-slate-400 block">সঠিক উত্তর</span>
                              <strong className="text-base text-emerald-300">{correctCount}টি</strong>
                            </div>
                            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                              <span className="text-[10px] text-slate-400 block">ভুল উত্তর (-0.25)</span>
                              <strong className="text-base text-rose-400">{incorrectCount}টি</strong>
                            </div>
                            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                              <span className="text-[10px] text-slate-400 block">অনুত্তরিত</span>
                              <strong className="text-base text-slate-400">{totalQ - (correctCount + incorrectCount)}টি</strong>
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
                                  <span className="font-bold text-slate-200">প্রশ্ন {idx + 1}. {q.question_bn}</span>
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

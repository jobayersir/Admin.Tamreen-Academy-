import React, { useState } from 'react';
import {
  Database,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Copy,
  CheckCircle2,
  Sparkles,
  Layers,
  Award,
  ChevronRight,
  X
} from 'lucide-react';
import { Question, Subject, CadreTier, Difficulty } from '../../types';
import { useToast } from '../Toast';

interface Props {
  questions: Question[];
  onSaveQuestion: (q: Omit<Question, 'id' | 'created_at'> & { id?: string }) => Promise<void>;
  onDeleteQuestion: (id: string) => Promise<void>;
}

export const QuestionBankTab: React.FC<Props> = ({
  questions,
  onSaveQuestion,
  onDeleteQuestion
}) => {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedCadre, setSelectedCadre] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');

  // Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    question_bn: '',
    question_ar: '',
    option_0: '',
    option_1: '',
    option_2: '',
    option_3: '',
    correct_option: 0,
    explanation: '',
    subject: 'বালাগাত ও মানতিক' as Subject,
    topic: 'সাধারণ',
    cadre_tier: 'প্রভাষক (আরবি)' as CadreTier,
    difficulty: 'মাঝারি' as Difficulty
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

  const difficultyList: Difficulty[] = ['সহজ', 'মাঝারি', 'কঠিন'];

  // Filter Logic
  const filteredQuestions = questions.filter((q) => {
    const term = search.toLowerCase();
    const matchesSearch =
      q.question_bn.toLowerCase().includes(term) ||
      (q.question_ar && q.question_ar.toLowerCase().includes(term)) ||
      q.explanation.toLowerCase().includes(term) ||
      (q.topic && q.topic.toLowerCase().includes(term));

    const matchesSubject = selectedSubject === 'All' || q.subject === selectedSubject;
    const matchesCadre = selectedCadre === 'All' || q.cadre_tier === selectedCadre;
    const matchesDifficulty = selectedDifficulty === 'All' || q.difficulty === selectedDifficulty;

    return matchesSearch && matchesSubject && matchesCadre && matchesDifficulty;
  });

  const handleOpenCreate = () => {
    setFormData({
      id: '',
      question_bn: '',
      question_ar: '',
      option_0: '',
      option_1: '',
      option_2: '',
      option_3: '',
      correct_option: 0,
      explanation: '',
      subject: 'বালাগাত ও মানতিক',
      topic: 'সাধারণ',
      cadre_tier: 'প্রভাষক (আরবি)',
      difficulty: 'মাঝারি'
    });
    setEditingQuestion(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (q: Question) => {
    setFormData({
      id: q.id,
      question_bn: q.question_bn,
      question_ar: q.question_ar || '',
      option_0: q.options[0] || '',
      option_1: q.options[1] || '',
      option_2: q.options[2] || '',
      option_3: q.options[3] || '',
      correct_option: q.correct_option,
      explanation: q.explanation,
      subject: q.subject,
      topic: q.topic || '',
      cadre_tier: q.cadre_tier,
      difficulty: q.difficulty
    });
    setEditingQuestion(q);
    setIsModalOpen(true);
  };

  const handleDuplicate = async (q: Question) => {
    try {
      await onSaveQuestion({
        question_bn: `${q.question_bn} (কপি)`,
        question_ar: q.question_ar,
        options: [...q.options] as [string, string, string, string],
        correct_option: q.correct_option,
        explanation: q.explanation,
        subject: q.subject,
        topic: q.topic,
        cadre_tier: q.cadre_tier,
        difficulty: q.difficulty,
        usage_count: 0
      });
      showToast('Duplicated', 'প্রশ্নটি ডুপ্লিকেট করা হয়েছে।', 'success');
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleDelete = async (id: string, text: string) => {
    if (confirm(`আপনি কি নিশ্চিত যে প্রশ্নটি মুছে ফেলতে চান?\n"${text.slice(0, 40)}..."`)) {
      try {
        await onDeleteQuestion(id);
        showToast('Deleted', 'প্রশ্নটি মুছে ফেলা হয়েছে।', 'success');
      } catch (err: any) {
        showToast('Error', err.message, 'error');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question_bn.trim()) {
      showToast('Error', 'প্রশ্ন বাংলা টেক্সট লিখুন', 'error');
      return;
    }
    if (!formData.option_0 || !formData.option_1 || !formData.option_2 || !formData.option_3) {
      showToast('Error', 'সব ৪টি অপশন পূরণ করা আবশ্যক', 'error');
      return;
    }

    try {
      await onSaveQuestion({
        id: formData.id || undefined,
        question_bn: formData.question_bn,
        question_ar: formData.question_ar || undefined,
        options: [formData.option_0, formData.option_1, formData.option_2, formData.option_3],
        correct_option: Number(formData.correct_option),
        explanation: formData.explanation,
        subject: formData.subject,
        topic: formData.topic,
        cadre_tier: formData.cadre_tier,
        difficulty: formData.difficulty
      });

      showToast('Saved', 'প্রশ্ন সফলভাবে সংরক্ষিত হয়েছে।', 'success');
      setIsModalOpen(false);
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white font-serif flex items-center gap-2">
            <Database className="w-6 h-6 text-emerald-400" />
            মাস্টার প্রশ্ন ব্যাংক ({questions.length}টি MCQ)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            আরবি ও বাংলা কিওয়ার্ড, বিষয়, ক্যাডার টার্গেট এবং ডিফিকাল্টি লেভেল অনুযায়ী ফিল্টার ও এডিট করুন।
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>ম্যানুয়ালি নতুন MCQ যোগ</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="আরবি বা বাংলা কিওয়ার্ড দিয়ে খুঁজুন..."
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
          value={selectedCadre}
          onChange={(e) => setSelectedCadre(e.target.value)}
          className="bg-slate-900 text-slate-200 text-xs rounded-xl px-3 py-2.5 border border-slate-800 focus:border-emerald-500 focus:outline-none"
        >
          <option value="All">সব ক্যাডার টার্গেট (All Cadres)</option>
          {cadreTiersList.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="bg-slate-900 text-slate-200 text-xs rounded-xl px-3 py-2.5 border border-slate-800 focus:border-emerald-500 focus:outline-none"
        >
          <option value="All">সব কঠিনতার মাত্রা (All Difficulties)</option>
          {difficultyList.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map((q, qIdx) => (
          <div
            key={q.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-md space-y-3"
          >
            {/* Top Badges */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div className="flex flex-wrap items-center gap-2 text-[10px]">
                <span className="font-bold text-emerald-400 font-mono text-xs">#{qIdx + 1}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-emerald-300 border border-slate-700 font-medium">
                  {q.subject}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700 font-medium">
                  {q.cadre_tier}
                </span>
                {q.topic && (
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                    টপিক: {q.topic}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span className={`px-2 py-0.5 rounded font-medium ${
                  q.difficulty === 'সহজ' ? 'text-teal-400 bg-teal-950/60' : q.difficulty === 'কঠিন' ? 'text-rose-400 bg-rose-950/60' : 'text-amber-400 bg-amber-950/60'
                }`}>
                  ডিফিকাল্টি: {q.difficulty}
                </span>
                <span>মডেল টেস্টে ব্যবহার: {q.usage_count || 0} বার</span>
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white leading-relaxed">{q.question_bn}</h3>
              {q.question_ar && (
                <p className="font-serif text-amber-300 text-right text-base leading-relaxed pt-1 font-semibold" dir="rtl">
                  {q.question_ar}
                </p>
              )}
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-sans">
              {q.options.map((opt, oIdx) => {
                const isCorrect = oIdx === q.correct_option;
                return (
                  <div
                    key={oIdx}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                      isCorrect
                        ? 'bg-emerald-950/60 border-emerald-600/90 text-emerald-200 font-medium shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${
                        isCorrect ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {['ক', 'খ', 'গ', 'ঘ'][oIdx]}
                      </span>
                      <span>{opt}</span>
                    </div>
                    {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </div>
                );
              })}
            </div>

            {/* Explanation Box */}
            {q.explanation && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <span className="font-bold text-emerald-400">ব্যাখ্যা &amp; রেফারেন্স: </span>
                {q.explanation}
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
              <button
                onClick={() => handleDuplicate(q)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                title="ডুপ্লিকেট করুন"
              >
                <Copy className="w-3.5 h-3.5" />
                কপি
              </button>
              <button
                onClick={() => handleOpenEdit(q)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs transition-colors"
                title="এডিট করুন"
              >
                <Edit className="w-3.5 h-3.5" />
                এডিট
              </button>
              <button
                onClick={() => handleDelete(q.id, q.question_bn)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                title="ডিলিট করুন"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredQuestions.length === 0 && (
        <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-sm">
          কোনো প্রশ্ন পাওয়া যায়নি। অনুসন্ধান ফিল্টার পরিবর্তন করুন অথবা নতুন MCQ যোগ করুন।
        </div>
      )}

      {/* CREATE / EDIT MCQ MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white font-serif flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              {editingQuestion ? 'MCQ এডিট করুন' : 'নতুন MCQ তৈরি করুন'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">বিষয় (Subject) *</label>
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
                  <label className="block text-slate-300 font-medium mb-1">ক্যাডার টার্গেট *</label>
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

                <div>
                  <label className="block text-slate-300 font-medium mb-1">ডিফিকাল্টি</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as Difficulty })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                  >
                    {difficultyList.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">প্রশ্ন বাংলা টেক্সট *</label>
                <textarea
                  rows={2}
                  value={formData.question_bn}
                  onChange={(e) => setFormData({ ...formData, question_bn: e.target.value })}
                  placeholder="যেমন: বালাগাত শাস্ত্রে ইস্তিয়ারা শব্দের শাব্দিক অর্থ কী?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">প্রশ্ন আরবি টেক্সট (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={formData.question_ar}
                  onChange={(e) => setFormData({ ...formData, question_ar: e.target.value })}
                  placeholder="যেমন: ما هو التعريف الدقيق للاستعارة؟"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-amber-300 font-serif focus:border-emerald-500 focus:outline-none text-right"
                  dir="rtl"
                />
              </div>

              {/* 4 Options Input */}
              <div className="space-y-2">
                <label className="block text-slate-300 font-medium">৪টি অপশন ও সঠিক উত্তর নির্বাচন করুন *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[0, 1, 2, 3].map((oIdx) => (
                    <div
                      key={oIdx}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                        formData.correct_option === oIdx
                          ? 'bg-emerald-950/60 border-emerald-600'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <input
                        type="radio"
                        name="correct_option"
                        checked={formData.correct_option === oIdx}
                        onChange={() => setFormData({ ...formData, correct_option: oIdx })}
                        className="text-emerald-500 focus:ring-emerald-500"
                      />
                      <span className="font-bold text-slate-400">
                        {['ক', 'খ', 'গ', 'ঘ'][oIdx]}.
                      </span>
                      <input
                        type="text"
                        value={
                          oIdx === 0
                            ? formData.option_0
                            : oIdx === 1
                            ? formData.option_1
                            : oIdx === 2
                            ? formData.option_2
                            : formData.option_3
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (oIdx === 0) setFormData({ ...formData, option_0: val });
                          else if (oIdx === 1) setFormData({ ...formData, option_1: val });
                          else if (oIdx === 2) setFormData({ ...formData, option_2: val });
                          else setFormData({ ...formData, option_3: val });
                        }}
                        placeholder={`অপশন ${['ক', 'খ', 'গ', 'ঘ'][oIdx]}`}
                        className="w-full bg-transparent text-slate-100 text-xs focus:outline-none"
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">বিস্তারিত ব্যাখ্যা &amp; রেফারেন্স</label>
                <textarea
                  rows={3}
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  placeholder="উত্তর ব্যাখ্যার মূল যুক্তি ও কুরআন-হাদিস/ব্যাকরণ গ্রন্থের অনুচ্ছেদ রেফারেন্স..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
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
                  প্রশ্ন সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

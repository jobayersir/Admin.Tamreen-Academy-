import React, { useState } from 'react';
import {
  PenTool,
  Plus,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Sliders,
  Play,
  Loader2,
  Award,
  Edit,
  Trash2,
  X
} from 'lucide-react';
import { WrittenQuestion, Subject } from '../../types';
import { useToast } from '../Toast';

interface Props {
  writtenQuestions: WrittenQuestion[];
  onSaveWrittenQuestion: (wq: Omit<WrittenQuestion, 'id' | 'created_at'> & { id?: string }) => Promise<void>;
}

export const WrittenExamsTab: React.FC<Props> = ({
  writtenQuestions,
  onSaveWrittenQuestion
}) => {
  const { showToast } = useToast();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWq, setEditingWq] = useState<WrittenQuestion | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    subject: 'বালাগাত ও মানতিক' as Subject,
    marks: 10,
    question_bn: '',
    question_ar: '',
    model_answer_bn: '',
    model_answer_ar: '',
    rubric: '১. সংজ্ঞা ৩ নম্বর\n২. আরবি উদাহরণ ৩ নম্বর\n৩. বিশ্লেষণ ৪ নম্বর'
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

  // AI Evaluation Sandbox State
  const [selectedQuestionForSandbox, setSelectedQuestionForSandbox] = useState<WrittenQuestion | null>(
    writtenQuestions[0] || null
  );
  const [sandboxStudentSubmission, setSandboxStudentSubmission] = useState(
    'ইস্তিয়ারা তাছরিহিয়্যা হলো যে ইস্তিয়ারায় মুসাব্বাহ বিহ সরাসরি উল্লেখ থাকে। যেমন: رأيت أسداً। এতে সিংহ দ্বারা বীর পুরুষ বোঝানো হয়েছে।'
  );
  const [systemPrompt, setSystemPrompt] = useState(
    'Tamreen AI System Prompt: Evaluate candidate written answer based on accuracy of Arabic terms, clarity, and citations. Be firm yet encouraging.'
  );
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any | null>(null);

  const handleOpenCreate = () => {
    setFormData({
      id: '',
      title: '',
      subject: 'বালাগাত ও মানতিক',
      marks: 10,
      question_bn: '',
      question_ar: '',
      model_answer_bn: '',
      model_answer_ar: '',
      rubric: '১. সংজ্ঞা ৩ নম্বর\n২. আরবি উদাহরণ ৩ নম্বর\n৩. বিশ্লেষণ ৪ নম্বর'
    });
    setEditingWq(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (wq: WrittenQuestion) => {
    setFormData({
      id: wq.id,
      title: wq.title,
      subject: wq.subject,
      marks: wq.marks,
      question_bn: wq.question_bn,
      question_ar: wq.question_ar || '',
      model_answer_bn: wq.model_answer_bn,
      model_answer_ar: wq.model_answer_ar || '',
      rubric: wq.rubric
    });
    setEditingWq(wq);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.question_bn.trim()) {
      showToast('Error', 'শিরোনাম ও প্রশ্ন বাংলা টেক্সট পূরণ করুন', 'error');
      return;
    }

    try {
      await onSaveWrittenQuestion({
        id: formData.id || undefined,
        title: formData.title,
        subject: formData.subject,
        marks: Number(formData.marks),
        question_bn: formData.question_bn,
        question_ar: formData.question_ar || undefined,
        model_answer_bn: formData.model_answer_bn,
        model_answer_ar: formData.model_answer_ar || undefined,
        rubric: formData.rubric
      });

      showToast('Saved', 'লিখিত প্রশ্ন ও নমুনা উত্তর সংরক্ষিত হয়েছে।', 'success');
      setIsModalOpen(false);
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleRunAIEvaluation = async () => {
    if (!selectedQuestionForSandbox) return;
    if (!sandboxStudentSubmission.trim()) {
      showToast('Error', 'পরীক্ষার্থীর উত্তর টাইপ করুন', 'error');
      return;
    }

    setIsEvaluating(true);
    setEvaluationResult(null);

    try {
      const res = await fetch('/api/ai/evaluate-written', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: selectedQuestionForSandbox.question_bn,
          modelAnswer: selectedQuestionForSandbox.model_answer_bn,
          userSubmission: sandboxStudentSubmission,
          systemPrompt: systemPrompt,
          maxMarks: selectedQuestionForSandbox.marks
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Evaluation failed');

      setEvaluationResult(data);
      showToast('Evaluated!', 'Gemini AI সফলভাবে লিখিত উত্তর মূল্যায়ন করেছে!', 'success');
    } catch (err: any) {
      showToast('AI Error', err.message, 'error');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white font-serif flex items-center gap-2">
            <PenTool className="w-6 h-6 text-emerald-400" />
            সিকিউ ও লিখিত পরীক্ষা গাইডলাইন (Written &amp; CQ)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            লিখিত পরীক্ষার নমুনা উত্তর, আরবি উদ্ধৃতি ও তামরীন এআই সিস্টেম প্রম্পট কনফিগারেশন।
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন লিখিত প্রশ্ন যুক্ত করুন</span>
        </button>
      </div>

      {/* Main Grid: Left Questions List, Right AI Evaluation Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Written Questions List */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white font-serif flex items-center justify-between">
            <span>সংরক্ষিত লিখিত প্রশ্নব্যাংক ({writtenQuestions.length}টি)</span>
          </h3>

          <div className="space-y-3">
            {writtenQuestions.map((wq) => (
              <div
                key={wq.id}
                onClick={() => setSelectedQuestionForSandbox(wq)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedQuestionForSandbox?.id === wq.id
                    ? 'bg-slate-900 border-emerald-500/80 shadow-md ring-1 ring-emerald-500/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700 font-medium">
                    {wq.subject}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-amber-400 font-bold">{wq.marks} মার্কস</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(wq);
                      }}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="font-bold text-white text-sm font-serif">{wq.title}</h4>
                <p className="text-xs text-slate-300 mt-1">{wq.question_bn}</p>

                <div className="mt-2 p-2 bg-slate-950 rounded-lg text-[11px] text-slate-400 line-clamp-2">
                  <span className="font-semibold text-emerald-400">নমুনা উত্তর: </span>
                  {wq.model_answer_bn}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Tamreen AI Evaluation Sandbox */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white font-serif flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                তামরীন এআই অটোগ্রেডিং স্যান্ডবক্স
              </h3>
              <p className="text-xs text-slate-400">Gemini AI রিয়েল-টাইম লিখিত উত্তর মূল্যায়ন পরীক্ষা</p>
            </div>
            {selectedQuestionForSandbox && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                {selectedQuestionForSandbox.marks} মার্কস
              </span>
            )}
          </div>

          {selectedQuestionForSandbox ? (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono block mb-0.5">নির্বাচিত প্রশ্ন:</span>
                <p className="font-bold text-white text-xs">{selectedQuestionForSandbox.question_bn}</p>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">সিস্টেম প্রম্পট &amp; মূল্যায়ন নীতি</label>
                <textarea
                  rows={2}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 text-xs focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">পরীক্ষার্থীর নমুনা উত্তর (Student Written Submission)</label>
                <textarea
                  rows={4}
                  value={sandboxStudentSubmission}
                  onChange={(e) => setSandboxStudentSubmission(e.target.value)}
                  placeholder="পরীক্ষার্থীর লিখিত উত্তর এখানে টাইপ করুন..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <button
                onClick={handleRunAIEvaluation}
                disabled={isEvaluating}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition-all shadow-md disabled:opacity-50"
              >
                {isEvaluating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Gemini AI মূল্যায়ন করছে...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Gemini AI দিয়ে অটো মূল্যায়ন চালান</span>
                  </>
                )}
              </button>

              {/* Evaluation Results Card */}
              {evaluationResult && (
                <div className="p-4 bg-slate-950 border border-emerald-700/80 rounded-2xl space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-white font-serif">এআই মূল্যায়ন রিপোর্ট</span>
                    <div className="text-lg font-bold font-mono text-emerald-400 bg-emerald-950 px-3 py-1 rounded-xl border border-emerald-800">
                      {evaluationResult.score} / {selectedQuestionForSandbox.marks}
                    </div>
                  </div>

                  <p className="text-slate-200 leading-relaxed">{evaluationResult.feedback_bn}</p>

                  {evaluationResult.strengths?.length > 0 && (
                    <div>
                      <span className="font-semibold text-emerald-400 block mb-1">শক্তিশালী দিকসমূহ:</span>
                      <ul className="list-disc list-inside text-slate-300 space-y-0.5 pl-1">
                        {evaluationResult.strengths.map((s: string, i: number) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {evaluationResult.improvements?.length > 0 && (
                    <div>
                      <span className="font-semibold text-amber-400 block mb-1">উন্নতির ক্ষেত্র:</span>
                      <ul className="list-disc list-inside text-slate-300 space-y-0.5 pl-1">
                        {evaluationResult.improvements.map((s: string, i: number) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              বামপাশের তালিকা থেকে একটি লিখিত প্রশ্ন নির্বাচন করুন।
            </div>
          )}
        </div>
      </div>

      {/* CREATE / EDIT WRITTEN QUESTION MODAL */}
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
              <PenTool className="w-5 h-5 text-emerald-400" />
              {editingWq ? 'লিখিত প্রশ্ন এডিট করুন' : 'নতুন লিখিত প্রশ্ন যোগ করুন'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-medium mb-1">প্রশ্ন শিরোনাম *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="যেমন: বালাগাত: ইস্তিয়ারা তাছরিহিয়্যা ও মাকনিয়্যার পার্থক্য"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">মার্কস (Marks)</label>
                  <input
                    type="number"
                    value={formData.marks}
                    onChange={(e) => setFormData({ ...formData, marks: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">প্রশ্ন বাংলা বিবরণী *</label>
                <textarea
                  rows={2}
                  value={formData.question_bn}
                  onChange={(e) => setFormData({ ...formData, question_bn: e.target.value })}
                  placeholder="লিখিত প্রশ্নটি বিস্তারিত লিখুন..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">নমুনা উত্তর (বাংলা)</label>
                <textarea
                  rows={3}
                  value={formData.model_answer_bn}
                  onChange={(e) => setFormData({ ...formData, model_answer_bn: e.target.value })}
                  placeholder="আদর্শ নমুনা উত্তর লিখুন..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">মূল্যায়ন রুব্রিক (Evaluation Rubric Points)</label>
                <textarea
                  rows={2}
                  value={formData.rubric}
                  onChange={(e) => setFormData({ ...formData, rubric: e.target.value })}
                  placeholder="নম্বর বন্টন ও মূল্যায়নের শর্তাবলী..."
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
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

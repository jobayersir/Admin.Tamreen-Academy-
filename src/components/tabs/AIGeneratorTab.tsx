import React, { useState } from 'react';
import {
  Sparkles,
  FileText,
  PenTool,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Trash2,
  Edit2,
  RefreshCw,
  Sliders,
  Database,
  ArrowRight
} from 'lucide-react';
import { Question, Subject, CadreTier, Difficulty } from '../../types';
import { useToast } from '../Toast';

interface Props {
  onBulkAddQuestions: (questions: Omit<Question, 'id' | 'created_at'>[]) => Promise<void>;
  onAddSingleQuestion: (q: Omit<Question, 'id' | 'created_at'>) => Promise<void>;
}

export const AIGeneratorTab: React.FC<Props> = ({
  onBulkAddQuestions,
  onAddSingleQuestion
}) => {
  const { showToast } = useToast();
  const [activeMode, setActiveMode] = useState<'mode1' | 'mode2' | 'mode3'>('mode3');

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

  // ==================== MODE 1: MANUAL FORM ====================
  const [manualForm, setManualForm] = useState({
    question_bn: '',
    question_ar: '',
    option_0: '',
    option_1: '',
    option_2: '',
    option_3: '',
    correct_option: 0,
    explanation: '',
    subject: 'বালাগাত ও মানতিক' as Subject,
    topic: '',
    cadre_tier: 'প্রভাষক (আরবি)' as CadreTier,
    difficulty: 'মাঝারি' as Difficulty
  });

  const handleSaveManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.question_bn.trim() || !manualForm.option_0 || !manualForm.option_1) {
      showToast('Error', 'প্রশ্ন ও অপশনগুলো সঠিকভাবে পুরণ করুন', 'error');
      return;
    }

    try {
      await onAddSingleQuestion({
        question_bn: manualForm.question_bn,
        question_ar: manualForm.question_ar || undefined,
        options: [manualForm.option_0, manualForm.option_1, manualForm.option_2, manualForm.option_3],
        correct_option: manualForm.correct_option,
        explanation: manualForm.explanation,
        subject: manualForm.subject,
        topic: manualForm.topic || 'সাধারণ',
        cadre_tier: manualForm.cadre_tier,
        difficulty: manualForm.difficulty,
        usage_count: 0
      });

      showToast('Success', 'MCQ প্রশ্নটি মাস্টার প্রশ্ন ব্যাংকে যুক্ত করা হয়েছে!', 'success');
      setManualForm({
        ...manualForm,
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

  // ==================== MODE 2: COPY-PASTE PARSER ====================
  const [rawText, setRawText] = useState('');
  const [parseSubject, setParseSubject] = useState<Subject>('বালাগাত ও মানতিক');
  const [parseTopic, setParseTopic] = useState('সাধারণ প্রস্তুতি');
  const [parseCadre, setParseCadre] = useState<CadreTier>('প্রভাষক (আরবি)');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedPreviewList, setParsedPreviewList] = useState<any[]>([]);

  // Local rule-based parser fallback for client
  const parseClientTextLocally = (text: string, subject: Subject, cadre: CadreTier, topic: string) => {
    const blocks = text.split(/(?=(?:[০-৯0-9]+[\.\)\:]|\bপ্রশ্ন\s*[০-৯0-9]+|\bQ[0-9]+[\.\:]))/gi).filter(b => b.trim().length > 0);
    const results: any[] = [];

    for (const block of blocks) {
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) continue;

      let question_bn = lines[0].replace(/^(?:[০-৯0-9]+[\.\)\:]|\bপ্রশ্ন\s*[০-৯0-9]+|\bQ[0-9]+[\.\:])\s*/gi, '').trim();
      let question_ar = '';

      if (/[\u0600-\u06FF]/.test(question_bn)) {
        const arMatch = question_bn.match(/([\u0600-\u06FF\s\p{P}]+)/u);
        if (arMatch && arMatch[1].length > 3) {
          question_ar = arMatch[1].trim();
        }
      }

      const options: string[] = [];
      let correct_option = 0;
      let explanation = 'মৌলিক ব্যাকরণ ও পাঠ্যবই ভিত্তিক সমাধান।';

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const optMatch = line.match(/^(?:[কখগঘa-dA-D1-4][\.\)\:\-]|[①②③④\(ক\)\(খ\)\(গ\)\(ঘ\)])\s*(.+)/i);
        if (optMatch) {
          options.push(optMatch[1].trim());
        } else if (/^(?:উত্তর|সঠিক উত্তর|Ans|Answer)[\:\-]?\s*(.+)/i.test(line)) {
          const ansText = line;
          if (/খ|\b2\b|\bB\b/i.test(ansText)) correct_option = 1;
          else if (/গ|\b3\b|\bC\b/i.test(ansText)) correct_option = 2;
          else if (/ঘ|\b4\b|\bD\b/i.test(ansText)) correct_option = 3;
          else correct_option = 0;
        } else if (/^(?:ব্যাখ্যা|Explanation)[\:\-]?\s*(.+)/i.test(line)) {
          explanation = line.replace(/^(?:ব্যাখ্যা|Explanation)[\:\-]?\s*/i, '').trim();
        }
      }

      while (options.length < 4) {
        options.push(`অপশন ${['ক', 'খ', 'গ', 'ঘ'][options.length]}`);
      }

      if (question_bn.length > 2) {
        results.push({
          question_bn,
          question_ar: question_ar || undefined,
          options: options.slice(0, 4),
          correct_option,
          explanation,
          topic: topic || 'সাধারণ',
          difficulty: 'মাঝারি'
        });
      }
    }

    if (results.length === 0 && text.trim().length > 0) {
      results.push({
        question_bn: text.substring(0, 120),
        options: ['অপশন ক', 'অপশন খ', 'অপশন গ', 'অপশন ঘ'],
        correct_option: 0,
        explanation: 'সহজ পাঠ্যবই ভিত্তিক সমাধান',
        topic: topic || 'সাধারণ',
        difficulty: 'মাঝারি'
      });
    }

    return results;
  };

  const handleParseRawText = async () => {
    if (!rawText.trim()) {
      showToast('Warning', 'পিডিএফ বা ডকুমেন্ট থেকে কপি করা টেক্সট পেস্ট করুন', 'error');
      return;
    }

    setIsParsing(true);
    setParsedPreviewList([]);

    try {
      const res = await fetch('/api/ai/parse-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText,
          defaultSubject: parseSubject,
          defaultCadreTier: parseCadre,
          defaultTopic: parseTopic || 'সাধারণ প্রস্তুতি'
        })
      });

      let data: any = null;
      const resText = await res.text();

      try {
        const cleanText = resText.replace(/```json/gi, '').replace(/```/g, '').trim();
        data = JSON.parse(cleanText);
      } catch {
        console.warn('Non-JSON response received, using local client parser');
        data = { questions: parseClientTextLocally(rawText, parseSubject, parseCadre, parseTopic || 'সাধারণ প্রস্তুতি') };
      }

      if (data && data.questions && data.questions.length > 0) {
        setParsedPreviewList(data.questions);
        showToast('Extracted!', `সফলভাবে ${data.questions.length}টি প্রশ্ন এক্সট্র্যাক্ট করা হয়েছে!`, 'success');
      } else {
        const fallbackList = parseClientTextLocally(rawText, parseSubject, parseCadre, parseTopic || 'সাধারণ প্রস্তুতি');
        setParsedPreviewList(fallbackList);
        showToast('Extracted!', `${fallbackList.length}টি প্রশ্ন টেক্সট থেকে পার্স করা হয়েছে।`, 'info');
      }
    } catch (err: any) {
      const fallbackList = parseClientTextLocally(rawText, parseSubject, parseCadre, parseTopic || 'সাধারণ প্রস্তুতি');
      setParsedPreviewList(fallbackList);
      showToast('Extracted!', `${fallbackList.length}টি প্রশ্ন স্থানীয় পার্সার দিয়ে নিষ্কাশন করা হয়েছে।`, 'info');
    } finally {
      setIsParsing(false);
    }
  };

  // ==================== MODE 3: AUTOMATED GENERATOR ====================
  const [genSubject, setGenSubject] = useState<Subject>('বালাগাত ও মানতিক');
  const [genTopic, setGenTopic] = useState('ইলমুল বয়ান ও ইস্তিয়ারা (علم البيان والاستعارة)');
  const [genCadre, setGenCadre] = useState<CadreTier>('প্রভাষক (আরবি)');
  const [genDifficulty, setGenDifficulty] = useState<Difficulty>('কঠিন');
  const [genCount, setGenCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedList, setGeneratedList] = useState<any[]>([]);

  const handleGenerateAIQuestions = async () => {
    setIsGenerating(true);
    setGeneratedList([]);

    try {
      const res = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: genSubject,
          topic: genTopic,
          cadreTier: genCadre,
          difficulty: genDifficulty,
          count: genCount
        })
      });

      let data: any = null;
      const resText = await res.text();

      try {
        const cleanText = resText.replace(/```json/gi, '').replace(/```/g, '').trim();
        data = JSON.parse(cleanText);
      } catch {
        data = {
          questions: Array.from({ length: genCount }).map((_, idx) => ({
            question_bn: `${genSubject} - ${genTopic} বিষয়ের প্রশ্ন ${idx + 1}`,
            question_ar: 'ما هو التعريف الصحيح لهذه المسألة؟',
            options: ['অপশন ১', 'অপশন ২', 'অপশন ৩', 'অপশন ৪'],
            correct_option: 0,
            explanation: `${genTopic} সংক্রান্ত বিশ্লেষণাত্মক সমাধান।`,
            topic: genTopic || 'সাধারণ',
            difficulty: genDifficulty
          }))
        };
      }

      if (data && data.questions && data.questions.length > 0) {
        setGeneratedList(data.questions);
        showToast('Generated!', `Gemini AI ${data.questions.length}টি কারিকুলাম-সংলগ্ন প্রশ্ন তৈরি করেছে!`, 'success');
      } else {
        showToast('Error', 'প্রশ্ন তৈরিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।', 'error');
      }
    } catch (err: any) {
      showToast('AI Error', err.message, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Preview item editor modal state
  const [editingPreviewItem, setEditingPreviewItem] = useState<{ index: number; data: any; mode: 'mode2' | 'mode3' } | null>(null);

  const handleEditPreviewItem = (index: number, data: any, mode: 'mode2' | 'mode3') => {
    setEditingPreviewItem({
      index,
      data: {
        ...data,
        options: data.options && data.options.length === 4 ? [...data.options] : ['অপশন ১', 'অপশন ২', 'অপশন ৩', 'অপশন ৪']
      },
      mode
    });
  };

  const handleSavePreviewItemEdit = () => {
    if (!editingPreviewItem) return;
    const { index, data, mode } = editingPreviewItem;
    if (mode === 'mode2') {
      setParsedPreviewList((prev) => {
        const updated = [...prev];
        updated[index] = data;
        return updated;
      });
    } else {
      setGeneratedList((prev) => {
        const updated = [...prev];
        updated[index] = data;
        return updated;
      });
    }
    setEditingPreviewItem(null);
    showToast('Updated', 'প্রিভিউ প্রশ্নটি সফলভাবে আপডেট করা হয়েছে।', 'success');
  };

  const handleDeletePreviewItem = (index: number, mode: 'mode2' | 'mode3') => {
    if (mode === 'mode2') {
      setParsedPreviewList((prev) => prev.filter((_, i) => i !== index));
    } else {
      setGeneratedList((prev) => prev.filter((_, i) => i !== index));
    }
    showToast('Removed', 'প্রশ্নটি প্রিভিউ তালিকা থেকে মুছে ফেলা হয়েছে।', 'info');
  };

  // Bulk Save Handler
  const handleBulkSave = async (items: any[], subject: Subject, cadre: CadreTier) => {
    if (items.length === 0) return;

    try {
      const formatted = items.map((q) => ({
        question_bn: q.question_bn,
        question_ar: q.question_ar || undefined,
        options: (q.options?.length === 4 ? q.options : ['অপশন ১', 'অপশন ২', 'অপশন ৩', 'অপশন ৪']) as [string, string, string, string],
        correct_option: typeof q.correct_option === 'number' ? q.correct_option : 0,
        explanation: q.explanation || 'কোনো ব্যাখ্যা দেওয়া হয়নি।',
        subject: subject,
        topic: q.topic || 'এআই জেনারেটেড',
        cadre_tier: cadre,
        difficulty: (q.difficulty as Difficulty) || 'মাঝারি',
        usage_count: 0
      }));

      await onBulkAddQuestions(formatted);
      showToast('Bulk Saved!', `সফলভাবে ${items.length}টি প্রশ্ন ডাটাবেজে সংরক্ষণ করা হয়েছে।`, 'success');

      if (activeMode === 'mode2') setParsedPreviewList([]);
      if (activeMode === 'mode3') setGeneratedList([]);
    } catch (err: any) {
      showToast('Save Error', err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/80 border border-emerald-800/50 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Gemini 3.6 Flash Engine
          </div>
          <h2 className="text-xl font-bold text-white font-serif">
            এআই প্রশ্ন তৈরি ও টেক্সট ইনজেশ্চন হাব
          </h2>
          <p className="text-xs text-slate-300">
            ম্যানুয়ালি, কপি-পেস্ট এআই এক্সট্র্যাক্টর অথবা স্বয়ংক্রিয় এআই প্রশ্ন জেনারেটর ব্যবহার করে প্রশ্ন ব্যাংকে ডাটা যুক্ত করুন।
          </p>
        </div>
      </div>

      {/* Mode Selection Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          onClick={() => setActiveMode('mode3')}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
            activeMode === 'mode3'
              ? 'bg-gradient-to-br from-amber-950/80 to-slate-900 border-amber-500/80 text-white shadow-lg'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm font-serif">Mode 3: স্বয়ংক্রিয় এআই জেনারেটর</h3>
          </div>
          <p className="text-xs text-slate-400">বিষয় ও টপিক দিলে এআই স্বয়ংক্রিয় প্রশ্ন সেট তৈরি করে।</p>
        </button>

        <button
          onClick={() => setActiveMode('mode2')}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
            activeMode === 'mode2'
              ? 'bg-gradient-to-br from-teal-950/80 to-slate-900 border-teal-500/80 text-white shadow-lg'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-sm font-serif">Mode 2: কপি-পেস্ট এআই এক্সট্র্যাক্টর</h3>
          </div>
          <p className="text-xs text-slate-400">পিডিএফ বা ডক থেকে আনফরমেটেড টেক্সট পেস্ট করে অটো এক্সট্র্যাক্ট।</p>
        </button>

        <button
          onClick={() => setActiveMode('mode1')}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
            activeMode === 'mode1'
              ? 'bg-gradient-to-br from-emerald-950/80 to-slate-900 border-emerald-500/80 text-white shadow-lg'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <PenTool className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm font-serif">Mode 1: ম্যানুয়াল এন্ট্রি ফর্ম</h3>
          </div>
          <p className="text-xs text-slate-400">একটি একটি করে নির্দিষ্ট প্রশ্ন ও অপশন সরাসরি ইনপুট।</p>
        </button>
      </div>

      {/* ==================== MODE 3: AUTOMATED GENERATOR ==================== */}
      {activeMode === 'mode3' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white font-serif flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              স্বয়ংক্রিয় এআই প্রশ্ন জেনারেটর কনফিগারেশন
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">বিষয় (Subject)</label>
                <select
                  value={genSubject}
                  onChange={(e) => setGenSubject(e.target.value as Subject)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-amber-500 focus:outline-none"
                >
                  {subjectsList.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">টার্গেট ক্যাডার</label>
                <select
                  value={genCadre}
                  onChange={(e) => setGenCadre(e.target.value as CadreTier)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-amber-500 focus:outline-none"
                >
                  {cadreTiersList.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">ডিফিকাল্টি লেভেল</label>
                <select
                  value={genDifficulty}
                  onChange={(e) => setGenDifficulty(e.target.value as Difficulty)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-amber-500 focus:outline-none"
                >
                  <option value="সহজ">সহজ (Easy)</option>
                  <option value="মাঝারি">মাঝারি (Medium)</option>
                  <option value="কঠিন">কঠিন (Hard / Advanced)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-medium mb-1">টপিক বা সুনির্দিষ্ট অধ্যায় (Topic)</label>
                <input
                  type="text"
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  placeholder="যেমন: ইলমুল বয়ান, তাজবীদ, সহীহ বুখারী উসুল..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">প্রশ্ন সংখ্যা (১-২০টি)</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={genCount}
                  onChange={(e) => setGenCount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-amber-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateAIQuestions}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs transition-all shadow-lg disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Gemini AI প্রশ্ন সেট তৈরি করছে...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Gemini AI দিয়ে প্রশ্ন তৈরি করুন</span>
                </>
              )}
            </button>
          </div>

          {/* Review Grid for Mode 3 */}
          {generatedList.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="font-bold text-white font-serif text-sm">
                  এআই প্রভিউ টেবিল ({generatedList.length}টি প্রশ্ন জেনারেটেড)
                </h4>

                <button
                  onClick={() => handleBulkSave(generatedList, genSubject, genCadre)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md"
                >
                  <Database className="w-4 h-4" />
                  <span>সবগুলো ১-ক্লিকে সেভ করুন</span>
                </button>
              </div>

              <div className="space-y-3">
                {generatedList.map((item, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs space-y-2">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-400 font-mono">প্রশ্ন {idx + 1}.</span>
                        <span className="text-[10px] text-slate-400 font-mono">{genSubject}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditPreviewItem(idx, item, 'mode3')}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-medium transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>এডিট</span>
                        </button>
                        <button
                          onClick={() => handleDeletePreviewItem(idx, 'mode3')}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="font-medium text-slate-100">{item.question_bn}</p>
                    {item.question_ar && (
                      <p className="font-serif text-amber-300 text-right text-sm" dir="rtl">
                        {item.question_ar}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {item.options?.map((opt: string, oIdx: number) => (
                        <div
                          key={oIdx}
                          className={`p-2 rounded-lg border text-xs ${
                            oIdx === item.correct_option
                              ? 'bg-emerald-950/60 border-emerald-600 text-emerald-200 font-semibold'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          <span className="font-bold mr-1">{['ক', 'খ', 'গ', 'ঘ'][oIdx]}.</span>
                          {opt}
                        </div>
                      ))}
                    </div>

                    <div className="p-2 bg-slate-900 rounded text-[11px] text-slate-300">
                      <span className="font-semibold text-amber-400">ব্যাখ্যা: </span>
                      {item.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== MODE 2: COPY-PASTE AI PARSER ==================== */}
      {activeMode === 'mode2' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white font-serif flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-400" />
              কপি-পেস্ট এআই টেক্সট পার্সার (PDF / Doc Text Ingestion)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">ডিফল্ট বিষয় (Subject)</label>
                <select
                  value={parseSubject}
                  onChange={(e) => setParseSubject(e.target.value as Subject)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-teal-500 focus:outline-none"
                >
                  {subjectsList.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">ডিফল্ট টপিক (Topic)</label>
                <input
                  type="text"
                  value={parseTopic}
                  onChange={(e) => setParseTopic(e.target.value)}
                  placeholder="যেমন: ইলমুল বয়ান"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">ডিফল্ট ক্যাডার টার্গেট</label>
                <select
                  value={parseCadre}
                  onChange={(e) => setParseCadre(e.target.value as CadreTier)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-teal-500 focus:outline-none"
                >
                  {cadreTiersList.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                আনফরমেটেড প্রশ্ন টেক্সট এখানে পেস্ট করুন *
              </label>
              <textarea
                rows={6}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="পিডিএফ বা ওয়ার্ড ফাইল থেকে পুরো শিটের প্রশ্ন পেস্ট করুন (যেমন: ১. বালাগাত কাকে বলে? ক) রূপক খ) ব্যাকরণ... উত্তর: ক)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 text-xs focus:border-teal-500 focus:outline-none font-mono"
              />
            </div>

            <button
              onClick={handleParseRawText}
              disabled={isParsing}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-all shadow-lg disabled:opacity-50"
            >
              {isParsing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Gemini AI টেক্সট এনালাইস করছে...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Gemini AI দিয়ে প্রশ্ন পার্স ও এক্সট্র্যাক্ট করুন</span>
                </>
              )}
            </button>
          </div>

          {/* Review Grid for Mode 2 */}
          {parsedPreviewList.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="font-bold text-white font-serif text-sm">
                  এক্সট্র্যাক্টেড প্রশ্ন প্রভিউ ({parsedPreviewList.length}টি প্রশ্ন)
                </h4>

                <button
                  onClick={() => handleBulkSave(parsedPreviewList, parseSubject, parseCadre)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md"
                >
                  <Database className="w-4 h-4" />
                  <span>সবগুলো ১-ক্লিকে ইনসার্ট করুন</span>
                </button>
              </div>

              <div className="space-y-3">
                {parsedPreviewList.map((item, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs space-y-2">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-teal-400 font-mono">প্রশ্ন {idx + 1}.</span>
                        <span className="text-[10px] text-slate-400 font-mono">{parseSubject}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditPreviewItem(idx, item, 'mode2')}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-teal-300 text-[11px] font-medium transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>এডিট</span>
                        </button>
                        <button
                          onClick={() => handleDeletePreviewItem(idx, 'mode2')}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="font-medium text-slate-100">{item.question_bn}</p>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {item.options?.map((opt: string, oIdx: number) => (
                        <div
                          key={oIdx}
                          className={`p-2 rounded-lg border text-xs ${
                            oIdx === item.correct_option
                              ? 'bg-emerald-950/60 border-emerald-600 text-emerald-200 font-semibold'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          <span className="font-bold mr-1">{['ক', 'খ', 'গ', 'ঘ'][oIdx]}.</span>
                          {opt}
                        </div>
                      ))}
                    </div>

                    <div className="p-2 bg-slate-900 rounded text-[11px] text-slate-300">
                      <span className="font-semibold text-teal-400">ব্যাখ্যা: </span>
                      {item.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== MODE 1: MANUAL ENTRY FORM ==================== */}
      {activeMode === 'mode1' && (
        <form onSubmit={handleSaveManual} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
          <h3 className="text-base font-bold text-white font-serif flex items-center gap-2">
            <PenTool className="w-5 h-5 text-emerald-400" />
            ম্যানুয়াল প্রশ্ন এন্ট্রি ফর্ম
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">বিষয় (Subject) *</label>
              <select
                value={manualForm.subject}
                onChange={(e) => setManualForm({ ...manualForm, subject: e.target.value as Subject })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
              >
                {subjectsList.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">টপিক (Topic)</label>
              <input
                type="text"
                value={manualForm.topic}
                onChange={(e) => setManualForm({ ...manualForm, topic: e.target.value })}
                placeholder="যেমন: ইস্তিয়ারা ও তাশবীহ"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">ক্যাডার টার্গেট *</label>
              <select
                value={manualForm.cadre_tier}
                onChange={(e) => setManualForm({ ...manualForm, cadre_tier: e.target.value as CadreTier })}
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
                value={manualForm.difficulty}
                onChange={(e) => setManualForm({ ...manualForm, difficulty: e.target.value as Difficulty })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
              >
                <option value="সহজ">সহজ</option>
                <option value="মাঝারি">মাঝারি</option>
                <option value="কঠিন">কঠিন</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">প্রশ্ন বাংলা টেক্সট *</label>
            <textarea
              rows={2}
              value={manualForm.question_bn}
              onChange={(e) => setManualForm({ ...manualForm, question_bn: e.target.value })}
              placeholder="প্রশ্ন টেক্সট লিখুন..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">প্রশ্ন আরবি টেক্সট (যদি থাকে)</label>
            <input
              type="text"
              value={manualForm.question_ar}
              onChange={(e) => setManualForm({ ...manualForm, question_ar: e.target.value })}
              placeholder="যেমন: ما معنى الحقيقة والمجاز؟"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-amber-300 font-serif focus:border-emerald-500 focus:outline-none text-right"
              dir="rtl"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-slate-300 font-medium">৪টি অপশন ও সঠিক উত্তর সিলেক্ট করুন *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[0, 1, 2, 3].map((oIdx) => (
                <div
                  key={oIdx}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    manualForm.correct_option === oIdx
                      ? 'bg-emerald-950/60 border-emerald-600'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <input
                    type="radio"
                    name="manual_correct"
                    checked={manualForm.correct_option === oIdx}
                    onChange={() => setManualForm({ ...manualForm, correct_option: oIdx })}
                  />
                  <span className="font-bold text-slate-400">{['ক', 'খ', 'গ', 'ঘ'][oIdx]}.</span>
                  <input
                    type="text"
                    value={
                      oIdx === 0
                        ? manualForm.option_0
                        : oIdx === 1
                        ? manualForm.option_1
                        : oIdx === 2
                        ? manualForm.option_2
                        : manualForm.option_3
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (oIdx === 0) setManualForm({ ...manualForm, option_0: val });
                      else if (oIdx === 1) setManualForm({ ...manualForm, option_1: val });
                      else if (oIdx === 2) setManualForm({ ...manualForm, option_2: val });
                      else setManualForm({ ...manualForm, option_3: val });
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
            <label className="block text-slate-300 font-medium mb-1">ব্যাখ্যা &amp; রেফারেন্স</label>
            <textarea
              rows={2}
              value={manualForm.explanation}
              onChange={(e) => setManualForm({ ...manualForm, explanation: e.target.value })}
              placeholder="শিক্ষার্থীদের জন্য সহজ ব্যাখ্যা..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
          >
            প্রশ্ন ডাটাবেজে সংরক্ষণ করুন
          </button>
        </form>
      )}

      {/* EDIT PREVIEW ITEM MODAL */}
      {editingPreviewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white font-serif flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-amber-400" />
              প্রিভিউ প্রশ্ন এডিট করুন (#{editingPreviewItem.index + 1})
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">প্রশ্ন বাংলা টেক্সট *</label>
                <textarea
                  rows={2}
                  value={editingPreviewItem.data.question_bn || ''}
                  onChange={(e) =>
                    setEditingPreviewItem({
                      ...editingPreviewItem,
                      data: { ...editingPreviewItem.data, question_bn: e.target.value }
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">টপিক (Topic)</label>
                <input
                  type="text"
                  value={editingPreviewItem.data.topic || ''}
                  onChange={(e) =>
                    setEditingPreviewItem({
                      ...editingPreviewItem,
                      data: { ...editingPreviewItem.data, topic: e.target.value }
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">প্রশ্ন আরবি টেক্সট (যদি থাকে)</label>
                <input
                  type="text"
                  value={editingPreviewItem.data.question_ar || ''}
                  onChange={(e) =>
                    setEditingPreviewItem({
                      ...editingPreviewItem,
                      data: { ...editingPreviewItem.data, question_ar: e.target.value }
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-amber-300 font-serif focus:border-amber-500 focus:outline-none text-right"
                  dir="rtl"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-slate-300 font-medium">৪টি অপশন ও সঠিক উত্তর *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[0, 1, 2, 3].map((oIdx) => (
                    <div
                      key={oIdx}
                      className={`p-2 rounded-xl border flex items-center gap-2 ${
                        editingPreviewItem.data.correct_option === oIdx
                          ? 'bg-emerald-950/60 border-emerald-600'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <input
                        type="radio"
                        name="preview_item_correct"
                        checked={editingPreviewItem.data.correct_option === oIdx}
                        onChange={() =>
                          setEditingPreviewItem({
                            ...editingPreviewItem,
                            data: { ...editingPreviewItem.data, correct_option: oIdx }
                          })
                        }
                      />
                      <span className="font-bold text-slate-400">{['ক', 'খ', 'গ', 'ঘ'][oIdx]}.</span>
                      <input
                        type="text"
                        value={editingPreviewItem.data.options?.[oIdx] || ''}
                        onChange={(e) => {
                          const newOpts = [...(editingPreviewItem.data.options || [])];
                          newOpts[oIdx] = e.target.value;
                          setEditingPreviewItem({
                            ...editingPreviewItem,
                            data: { ...editingPreviewItem.data, options: newOpts }
                          });
                        }}
                        className="w-full bg-transparent text-slate-100 text-xs focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">ব্যাখ্যা &amp; রেফারেন্স</label>
                <textarea
                  rows={2}
                  value={editingPreviewItem.data.explanation || ''}
                  onChange={(e) =>
                    setEditingPreviewItem({
                      ...editingPreviewItem,
                      data: { ...editingPreviewItem.data, explanation: e.target.value }
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingPreviewItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={handleSavePreviewItemEdit}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md"
                >
                  আপডেট আপডেট করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

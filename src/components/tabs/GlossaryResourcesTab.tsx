import React, { useState } from 'react';
import {
  BookMarked,
  FileText,
  Search,
  Plus,
  Edit,
  Trash2,
  Download,
  ShieldCheck,
  UploadCloud,
  FileCheck2,
  Check,
  X
} from 'lucide-react';
import { GlossaryTerm, LectureSheet, Subject } from '../../types';
import { useToast } from '../Toast';

interface Props {
  glossaryTerms: GlossaryTerm[];
  lectureSheets: LectureSheet[];
  onSaveGlossaryTerm: (term: Omit<GlossaryTerm, 'id' | 'created_at'> & { id?: string }) => Promise<void>;
  onDeleteGlossaryTerm: (id: string) => Promise<void>;
  onSaveLectureSheet: (sheet: Omit<LectureSheet, 'id' | 'created_at'> & { id?: string }) => Promise<void>;
  onDeleteLectureSheet: (id: string) => Promise<void>;
}

export const GlossaryResourcesTab: React.FC<Props> = ({
  glossaryTerms,
  lectureSheets,
  onSaveGlossaryTerm,
  onDeleteGlossaryTerm,
  onSaveLectureSheet,
  onDeleteLectureSheet
}) => {
  const { showToast } = useToast();
  const [subTab, setSubTab] = useState<'glossary' | 'pdfs'>('glossary');
  const [search, setSearch] = useState('');

  // Glossary Modal
  const [isGlossaryModalOpen, setIsGlossaryModalOpen] = useState(false);
  const [glossaryFormData, setGlossaryFormData] = useState({
    id: '',
    term_ar: '',
    term_bn: '',
    root_word: '',
    subject: 'বালাগাত ও মানতিক' as Subject,
    definition_bn: '',
    example_ar: '',
    example_bn: ''
  });

  // PDF Modal
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfFormData, setPdfFormData] = useState({
    id: '',
    title: '',
    subject: 'বালাগাত ও মানতিক' as Subject,
    file_url: 'https://example.com/lecture-note.pdf',
    file_size: '4.2 MB',
    is_vip_only: false
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

  // Filtered Glossary
  const filteredTerms = glossaryTerms.filter((t) => {
    const term = search.toLowerCase();
    return (
      t.term_ar.toLowerCase().includes(term) ||
      t.term_bn.toLowerCase().includes(term) ||
      (t.root_word && t.root_word.toLowerCase().includes(term)) ||
      t.definition_bn.toLowerCase().includes(term)
    );
  });

  // Filtered PDFs
  const filteredPdfs = lectureSheets.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.subject.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenCreateGlossary = () => {
    setGlossaryFormData({
      id: '',
      term_ar: '',
      term_bn: '',
      root_word: '',
      subject: 'বালাগাত ও মানতিক',
      definition_bn: '',
      example_ar: '',
      example_bn: ''
    });
    setIsGlossaryModalOpen(true);
  };

  const handleOpenEditGlossary = (t: GlossaryTerm) => {
    setGlossaryFormData({
      id: t.id,
      term_ar: t.term_ar,
      term_bn: t.term_bn,
      root_word: t.root_word || '',
      subject: t.subject,
      definition_bn: t.definition_bn,
      example_ar: t.example_ar || '',
      example_bn: t.example_bn || ''
    });
    setIsGlossaryModalOpen(true);
  };

  const handleSubmitGlossary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!glossaryFormData.term_ar || !glossaryFormData.definition_bn) {
      showToast('Error', 'শব্দ ও সংজ্ঞা পূরণ করুন', 'error');
      return;
    }

    try {
      await onSaveGlossaryTerm({
        id: glossaryFormData.id || undefined,
        term_ar: glossaryFormData.term_ar,
        term_bn: glossaryFormData.term_bn,
        root_word: glossaryFormData.root_word,
        subject: glossaryFormData.subject,
        definition_bn: glossaryFormData.definition_bn,
        example_ar: glossaryFormData.example_ar,
        example_bn: glossaryFormData.example_bn
      });
      showToast('Saved', 'শব্দকোষ পদটি সংরক্ষিত হয়েছে।', 'success');
      setIsGlossaryModalOpen(false);
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleSubmitPdf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfFormData.title || !pdfFormData.file_url) {
      showToast('Error', 'শিরোনাম ও ফাইল লিংক পূরণ করুন', 'error');
      return;
    }

    try {
      await onSaveLectureSheet({
        id: pdfFormData.id || undefined,
        title: pdfFormData.title,
        subject: pdfFormData.subject,
        file_url: pdfFormData.file_url,
        file_size: pdfFormData.file_size,
        is_vip_only: pdfFormData.is_vip_only,
        download_count: 0
      });
      showToast('Saved', 'পিডিএফ লেকচার শিট আপলোড করা হয়েছে।', 'success');
      setIsPdfModalOpen(false);
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
            <BookMarked className="w-6 h-6 text-emerald-400" />
            আরবি পারিভাষিক শব্দকোষ ও লেকচার পিডিএফ শিট
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            উসুল, ফিকহ্ ও বালাগাতের পরিভাষা ডাটাবেজ এবং ডাউনলোডযোগ্য লেকচার ফাইল গ্যালারি।
          </p>
        </div>

        {/* Subtab Switcher */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setSubTab('glossary')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              subTab === 'glossary'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            শব্দকোষ ({glossaryTerms.length})
          </button>

          <button
            onClick={() => setSubTab('pdfs')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              subTab === 'pdfs'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            পিডিএফ নোট ({lectureSheets.length})
          </button>
        </div>
      </div>

      {/* Search & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={subTab === 'glossary' ? "আরবি বা বাংলা পরিভাষা খুঁজুন..." : "পিডিএফ নোট শিরোনাম খুঁজুন..."}
            className="w-full bg-slate-900 text-slate-100 text-xs rounded-xl pl-9 pr-4 py-2.5 border border-slate-800 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {subTab === 'glossary' ? (
          <button
            onClick={handleOpenCreateGlossary}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন পরিভাষা যোগ</span>
          </button>
        ) : (
          <button
            onClick={() => setIsPdfModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md active:scale-95 shrink-0"
          >
            <UploadCloud className="w-4 h-4" />
            <span>নতুন পিডিএফ শিট আপলোড</span>
          </button>
        )}
      </div>

      {/* SUBTAB 1: GLOSSARY TERMS GRID */}
      {subTab === 'glossary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTerms.map((term) => (
            <div
              key={term.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-md space-y-3"
            >
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-xl font-bold font-serif text-amber-300" dir="rtl">
                    {term.term_ar}
                  </h3>
                  <span className="text-xs font-semibold text-white font-serif">{term.term_bn}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700 font-medium">
                    {term.subject}
                  </span>
                  <button
                    onClick={() => handleOpenEditGlossary(term)}
                    className="p-1 rounded text-slate-400 hover:text-white"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {term.root_word && (
                <div className="text-[11px] text-slate-400 font-mono">
                  <span className="font-semibold text-slate-300">মাদ্দাহ (মূলবর্ণ): </span>
                  <span className="text-amber-400 font-bold">{term.root_word}</span>
                </div>
              )}

              <p className="text-xs text-slate-200 leading-relaxed">{term.definition_bn}</p>

              {term.example_ar && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1 text-xs">
                  <span className="font-semibold text-emerald-400 text-[10px] uppercase font-mono block">প্রয়োগ ও নজীর:</span>
                  <p className="font-serif text-amber-300 text-right text-sm" dir="rtl">{term.example_ar}</p>
                  <p className="text-slate-400 text-[11px]">{term.example_bn}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* SUBTAB 2: LECTURE SHEETS / PDF GALLERY */}
      {subTab === 'pdfs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPdfs.map((pdf) => (
            <div
              key={pdf.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-md space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700 font-medium">
                  {pdf.subject}
                </span>

                {pdf.is_vip_only ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-amber-400" />
                    VIP Note
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-medium">
                    Free Note
                  </span>
                )}
              </div>

              <div className="flex items-start gap-3">
                <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm font-serif group-hover:text-emerald-300 transition-colors">
                    {pdf.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    আকার: {pdf.file_size} &bull; ডাউনলোডের সংখ্যা: {pdf.download_count || 0}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <a
                  href={pdf.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-emerald-400 hover:underline font-medium"
                >
                  <Download className="w-3.5 h-3.5" />
                  ডাউনলোড করুন (PDF)
                </a>

                <button
                  onClick={() => onDeleteLectureSheet(pdf.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                  title="Delete PDF Sheet"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE GLOSSARY MODAL */}
      {isGlossaryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
            <button
              onClick={() => setIsGlossaryModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white font-serif flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-emerald-400" />
              আরবি পরিভাষা যোগ বা সংশোধন
            </h3>

            <form onSubmit={handleSubmitGlossary} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">আরবি পারিভাষিক শব্দ *</label>
                  <input
                    type="text"
                    value={glossaryFormData.term_ar}
                    onChange={(e) => setGlossaryFormData({ ...glossaryFormData, term_ar: e.target.value })}
                    placeholder="যেমন: الإستعارة"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-amber-300 font-serif focus:border-emerald-500 focus:outline-none text-right"
                    dir="rtl"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">বাংলা নাম *</label>
                  <input
                    type="text"
                    value={glossaryFormData.term_bn}
                    onChange={(e) => setGlossaryFormData({ ...glossaryFormData, term_bn: e.target.value })}
                    placeholder="যেমন: ইস্তিয়ারা (রূপক)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">মাদ্দাহ (মূলবর্ণ)</label>
                  <input
                    type="text"
                    value={glossaryFormData.root_word}
                    onChange={(e) => setGlossaryFormData({ ...glossaryFormData, root_word: e.target.value })}
                    placeholder="যেমন: ع - و - ر"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">বিষয় (Subject)</label>
                  <select
                    value={glossaryFormData.subject}
                    onChange={(e) => setGlossaryFormData({ ...glossaryFormData, subject: e.target.value as Subject })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                  >
                    {subjectsList.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">বিস্তারিত সংজ্ঞা (Definition) *</label>
                <textarea
                  rows={3}
                  value={glossaryFormData.definition_bn}
                  onChange={(e) => setGlossaryFormData({ ...glossaryFormData, definition_bn: e.target.value })}
                  placeholder="পরিভাষার সংজ্ঞা সহজ বাংলায় লিখুন..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsGlossaryModalOpen(false)}
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

      {/* CREATE PDF MODAL */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsPdfModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white font-serif flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-emerald-400" />
              পিডিএফ লেকচার নোট আপলোড
            </h3>

            <form onSubmit={handleSubmitPdf} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">নোটের শিরোনাম *</label>
                <input
                  type="text"
                  value={pdfFormData.title}
                  onChange={(e) => setPdfFormData({ ...pdfFormData, title: e.target.value })}
                  placeholder="যেমন: বালাগাত হ্যান্ডনোট - ১৮তম এনটিআরসিএ"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">বিষয় (Subject)</label>
                <select
                  value={pdfFormData.subject}
                  onChange={(e) => setPdfFormData({ ...pdfFormData, subject: e.target.value as Subject })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                >
                  {subjectsList.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">পিডিএফ ইউআরএল / ফাইল ড্রাইভার লিংক *</label>
                <input
                  type="text"
                  value={pdfFormData.file_url}
                  onChange={(e) => setPdfFormData({ ...pdfFormData, file_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none font-mono"
                  required
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer p-3 bg-slate-950 rounded-xl border border-slate-800">
                <input
                  type="checkbox"
                  checked={pdfFormData.is_vip_only}
                  onChange={(e) => setPdfFormData({ ...pdfFormData, is_vip_only: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-amber-400 font-semibold">শুধুমাত্র ভিআইপি প্রিমিয়াম মেম্বারদের জন্য</span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPdfModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-semibold shadow-md"
                >
                  আপলোড সেভ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

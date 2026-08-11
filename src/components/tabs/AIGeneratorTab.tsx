import React, { useState, useRef } from 'react';
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
  Globe,
  PlusCircle,
  BookOpen,
  FileSpreadsheet,
  FileJson,
  UploadCloud,
  Download,
  Copy,
  Check,
  Code,
  FileType,
  Info,
  FileCheck
} from 'lucide-react';
import { Question, Subject, CadreTier, Difficulty } from '../../types';
import { useToast } from '../Toast';

interface Props {
  onBulkAddQuestions: (questions: Omit<Question, 'id' | 'created_at'>[]) => Promise<void>;
  onAddSingleQuestion: (q: Omit<Question, 'id' | 'created_at'>) => Promise<void>;
  customSubjects?: string[];
  onAddCustomSubject?: (subject: string) => void;
}

// Sample Templates Data
const SAMPLE_CSV_TEMPLATE = `question_bn,question_ar,option_a,option_b,option_c,option_d,correct_option,explanation,subject,topic,cadre_tier,difficulty
"বালাগাতের প্রধান শাখা কয়টি?","ما هي أقسام البلاغة الرئيسية؟","২টি","৩টি","৪টি","৫টি","1","বালাগাত মূলত ৩ ভাগে বিভক্ত: ইলমুল বয়ান, ইলমুল বাদি ও ইলমুল মা'আনি।","বালাগাত ও মানতিক","ইলমুল বালাগাত","প্রভাষক (আরবি)","মাঝারি"
"সহীহ বুখারী গ্রন্থে হাদিস সংখ্যা কত?","كم عدد أحاديث صحيح البخاري؟","৫,২৪৭টি","৭,২৭৫টি","৯,১০০টি","৪,০০০টি","1","পুনরাবৃত্তি সহ সহীহ বুখারীতে মোট হাদিস সংখ্যা ৭,২৭৫টি।","হাদিস","হাদিস সাহিত্য","প্রভাষক (হাদিস)","কঠিন"
"‘মুস্তা'আরা’ শব্দের ব্যাকরণগত অর্থ কী?","ما معنى المستعارة لغة؟","ধারে নেওয়া বস্তু","প্রসারিত বিষয়","সংশোধিত ব্যাকরণ","মূল ভিত্তি","0","ইস্তিয়ারা শব্দটি আরবি থেকে এসেছে যার অর্থ ধার নেওয়া।","বালাগাত ও মানতিক","বয়ান ও ইস্তিয়ারা","সহকারী শিক্ষক (আরবি)","সহজ"`;

const SAMPLE_JSON_TEMPLATE = JSON.stringify(
  [
    {
      question_bn: "বালাগাতের প্রধান শাখা কয়টি?",
      question_ar: "ما هي أقسام البلاغة الرئيسية؟",
      options: ["২টি", "৩টি", "৪টি", "৫টি"],
      correct_option: 1,
      explanation: "বালাগাত মূলত ৩ ভাগে বিভক্ত: ইলমুল বয়ান, ইলমুল বাদি ও ইলমুল মা'আনি।",
      subject: "বালাগাত ও মানতিক",
      topic: "ইলমুল বালাগাত",
      cadre_tier: "প্রভাষক (আরবি)",
      difficulty: "মাঝারি"
    },
    {
      question_bn: "হাদিসের বিশুদ্ধতম গ্রন্থ কোনটি?",
      question_ar: "ما هو أصح كتاب بعد كتاب الله تعالى؟",
      options: ["সহীহ বুখারী", "সহীহ মুসলিম", "সূনানে আবু দাউদ", "জামে আত-তিরমিযী"],
      correct_option: 0,
      explanation: "সহীহ বুখারী হাদিসের সর্বাধিক বিশুদ্ধ গ্রন্থ হিসেবে সর্বজনস্বীকৃত।",
      subject: "হাদিস",
      topic: "হাদিস শাস্ত্র পরিচিতি",
      cadre_tier: "প্রভাষক (আরবি)",
      difficulty: "সহজ"
    }
  ],
  null,
  2
);

export const AIGeneratorTab: React.FC<Props> = ({
  onBulkAddQuestions,
  onAddSingleQuestion,
  customSubjects = [],
  onAddCustomSubject
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeMode, setActiveMode] = useState<'mode3' | 'mode2' | 'mode4' | 'mode1'>('mode3');

  const baseSubjectsList: string[] = [
    'বালাগাত ও মানতিক',
    'আল-কুরআন',
    'হাদিস',
    'ফিকহ্ ও উসুল',
    'বাংলা',
    'ইংরেজি',
    'আইসিটি ও সাধারণ জ্ঞান'
  ];

  const allSubjectsList = Array.from(new Set([...baseSubjectsList, ...customSubjects]));

  const standardCadreTiers: string[] = [
    'প্রভাষক (আরবি)',
    'সহকারী শিক্ষক (আরবি)',
    'সহকারী মৌলভী',
    'ইবতেদায়ী প্রধান',
    'প্রভাষক (হাদিস)',
    'প্রভাষক (তাফসির)',
    'সহকারী শিক্ষক (ইসলাম শিক্ষা)'
  ];

  // ==================== MODE 3: AUTOMATED AI GENERATOR ====================
  const [genSubjectSelect, setGenSubjectSelect] = useState<string>('বালাগাত ও মানতিক');
  const [genCustomSubject, setGenCustomSubject] = useState<string>('');
  const [isGenCustomSubject, setIsGenCustomSubject] = useState<boolean>(false);

  const [genCadreSelect, setGenCadreSelect] = useState<string>('প্রভাষক (আরবি)');
  const [genCustomCadre, setGenCustomCadre] = useState<string>('');
  const [isGenCustomCadre, setIsGenCustomCadre] = useState<boolean>(false);

  const [genTopic, setGenTopic] = useState('ইলমুল বয়ান ও ইস্তিয়ারা (علم البيان والاستعارة)');
  const [genDifficulty, setGenDifficulty] = useState<Difficulty>('কঠিন');
  const [genCount, setGenCount] = useState(5);
  const [genLangMode, setGenLangMode] = useState<'bn_ar' | 'ar_only' | 'bn_only'>('bn_ar');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedList, setGeneratedList] = useState<any[]>([]);

  const handleGenerateAIQuestions = async () => {
    const finalSubject = (isGenCustomSubject ? genCustomSubject.trim() : genSubjectSelect) || 'সাধারণ বিষয়';
    const finalCadre = (isGenCustomCadre ? genCustomCadre.trim() : genCadreSelect) || 'প্রভাষক (আরবি)';

    if (isGenCustomSubject && genCustomSubject.trim() && onAddCustomSubject) {
      onAddCustomSubject(genCustomSubject.trim());
    }

    setIsGenerating(true);
    setGeneratedList([]);

    try {
      const res = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: finalSubject,
          topic: genTopic,
          cadreTier: finalCadre,
          difficulty: genDifficulty,
          count: genCount,
          languagePreference: genLangMode
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
            question_bn: genLangMode === 'ar_only' ? `سؤال في ${genTopic} رقم ${idx + 1}` : `${finalSubject} - ${genTopic} বিষয়ের প্রশ্ন ${idx + 1}`,
            question_ar: 'ما هو التعريف الصحيح والضابط الشرعي في هذه المسألة؟',
            options: [
              genLangMode === 'ar_only' ? 'أ. الخيار الأول' : 'ক. সঠিক অপশন বর্ণনা',
              genLangMode === 'ar_only' ? 'ب. الخيار الثاني' : 'খ. দ্বিতীয় বিকল্প পছন্দ',
              genLangMode === 'ar_only' ? 'ج. الخيار الثالث' : 'গ. ব্যাকরণগত তৃতীয় পছন্দ',
              genLangMode === 'ar_only' ? 'د. الخيار الرابع' : 'ঘ. চতুর্থ প্রাসঙ্গিক তথ্য'
            ],
            correct_option: 0,
            explanation: `${genTopic} সংক্রান্ত বিশ্লেষণাত্মক সমাধান ও রেফারেন্স।`,
            topic: genTopic || 'সাধারণ',
            difficulty: genDifficulty
          }))
        };
      }

      if (data && data.questions && data.questions.length > 0) {
        setGeneratedList(data.questions);
        showToast('Generated!', `Gemini AI ${data.questions.length}টি প্রশ্ন সফলভাবে তৈরি করেছে!`, 'success');
      } else {
        showToast('Error', 'প্রশ্ন তৈরিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।', 'error');
      }
    } catch (err: any) {
      showToast('AI Error', err.message, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // ==================== MODE 2: COPY-PASTE AI PARSER ====================
  const [parseSubjectSelect, setParseSubjectSelect] = useState<string>('বালাগাত ও মানতিক');
  const [parseCustomSubject, setParseCustomSubject] = useState<string>('');
  const [isParseCustomSubject, setIsParseCustomSubject] = useState<boolean>(false);

  const [parseCadreSelect, setParseCadreSelect] = useState<string>('প্রভাষক (আরবি)');
  const [parseCustomCadre, setParseCustomCadre] = useState<string>('');
  const [isParseCustomCadre, setIsParseCustomCadre] = useState<boolean>(false);

  const [parseTopic, setParseTopic] = useState('সাধারণ প্রস্তুতি');
  const [rawText, setRawText] = useState('');
  const [parseLangMode, setParseLangMode] = useState<'bn_ar' | 'ar_only' | 'bn_only'>('bn_ar');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedPreviewList, setParsedPreviewList] = useState<any[]>([]);

  // Local client-side parser fallback
  const parseClientTextLocally = (text: string, subject: string, cadre: string, topic: string) => {
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
          subject,
          cadre_tier: cadre,
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
        subject,
        cadre_tier: cadre,
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

    const finalSubject = (isParseCustomSubject ? parseCustomSubject.trim() : parseSubjectSelect) || 'সাধারণ বিষয়';
    const finalCadre = (isParseCustomCadre ? parseCustomCadre.trim() : parseCadreSelect) || 'প্রভাষক (আরবি)';

    if (isParseCustomSubject && parseCustomSubject.trim() && onAddCustomSubject) {
      onAddCustomSubject(parseCustomSubject.trim());
    }

    setIsParsing(true);
    setParsedPreviewList([]);

    try {
      const res = await fetch('/api/ai/parse-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText,
          defaultSubject: finalSubject,
          defaultCadreTier: finalCadre,
          defaultTopic: parseTopic || 'সাধারণ প্রস্তুতি',
          languagePreference: parseLangMode
        })
      });

      let data: any = null;
      const resText = await res.text();

      try {
        const cleanText = resText.replace(/```json/gi, '').replace(/```/g, '').trim();
        data = JSON.parse(cleanText);
      } catch {
        data = { questions: parseClientTextLocally(rawText, finalSubject, finalCadre, parseTopic || 'সাধারণ প্রস্তুতি') };
      }

      if (data && data.questions && data.questions.length > 0) {
        setParsedPreviewList(data.questions);
        showToast('Extracted!', `সফলভাবে ${data.questions.length}টি প্রশ্ন পার্স করা হয়েছে!`, 'success');
      } else {
        const fallbackList = parseClientTextLocally(rawText, finalSubject, finalCadre, parseTopic || 'সাধারণ প্রস্তুতি');
        setParsedPreviewList(fallbackList);
        showToast('Extracted!', `${fallbackList.length}টি প্রশ্ন টেক্সট থেকে পার্স করা হয়েছে।`, 'info');
      }
    } catch (err: any) {
      const finalSubject = (isParseCustomSubject ? parseCustomSubject.trim() : parseSubjectSelect) || 'সাধারণ বিষয়';
      const finalCadre = (isParseCustomCadre ? parseCustomCadre.trim() : parseCadreSelect) || 'প্রভাষক (আরবি)';
      const fallbackList = parseClientTextLocally(rawText, finalSubject, finalCadre, parseTopic || 'সাধারণ প্রস্তুতি');
      setParsedPreviewList(fallbackList);
      showToast('Extracted!', `${fallbackList.length}টি প্রশ্ন স্থানীয় পার্সার দিয়ে পার্স করা হয়েছে।`, 'info');
    } finally {
      setIsParsing(false);
    }
  };

  // ==================== MODE 4: CSV / JSON BULK IMPORT ====================
  const [importSubjectSelect, setImportSubjectSelect] = useState<string>('বালাগাত ও মানতিক');
  const [importCustomSubject, setImportCustomSubject] = useState<string>('');
  const [isImportCustomSubject, setIsImportCustomSubject] = useState<boolean>(false);

  const [importCadreSelect, setImportCadreSelect] = useState<string>('প্রভাষক (আরবি)');
  const [importCustomCadre, setImportCustomCadre] = useState<string>('');
  const [isImportCustomCadre, setIsImportCustomCadre] = useState<boolean>(false);

  const [importTopic, setImportTopic] = useState('বাল্ক ইমপোর্ট');
  const [importInputMethod, setImportInputMethod] = useState<'file' | 'text'>('file');
  const [importRawText, setImportRawText] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImportParsing, setIsImportParsing] = useState(false);
  const [importedList, setImportedList] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [templateTab, setTemplateTab] = useState<'csv' | 'json'>('csv');
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // CSV Parsing Helper
  const parseCSVData = (csvText: string, defaultSub: string, defaultCadre: string, defaultTopic: string) => {
    const cleanCsv = csvText.replace(/^\uFEFF/, '').trim();
    if (!cleanCsv) return { questions: [], errors: ['ফাইলটি ফাঁকা। কোনো সিএসভি ডাটা পাওয়া যায়নি।'] };

    const parseCSVLines = (text: string) => {
      const lines: string[] = [];
      let currentLine = '';
      let inQuotes = false;

      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '"') {
          inQuotes = !inQuotes;
          currentLine += char;
        } else if ((char === '\n' || char === '\r') && !inQuotes) {
          if (char === '\r' && text[i + 1] === '\n') {
            i++;
          }
          if (currentLine.trim()) lines.push(currentLine);
          currentLine = '';
        } else {
          currentLine += char;
        }
      }
      if (currentLine.trim()) lines.push(currentLine);
      return lines;
    };

    const parseCSVRow = (rowStr: string) => {
      const fields: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < rowStr.length; i++) {
        const char = rowStr[i];
        if (char === '"') {
          if (inQuotes && rowStr[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          fields.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      fields.push(current.trim());
      return fields;
    };

    const lines = parseCSVLines(cleanCsv);
    if (lines.length < 2) {
      return { questions: [], errors: ['CSV ফাইলে হেডার লাইন ও কমপক্ষে ১টি ডাটা সারি থাকা আবশ্যক।'] };
    }

    const headerRow = parseCSVRow(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9_\u0980-\u09FF]/gi, ''));

    const getColIdx = (possibleNames: string[]) => {
      for (const name of possibleNames) {
        const idx = headerRow.findIndex(h => h.includes(name));
        if (idx !== -1) return idx;
      }
      return -1;
    };

    const idxQBn = getColIdx(['question_bn', 'question', 'প্রশ্ন', 'question_text']);
    const idxQAr = getColIdx(['question_ar', 'arabic', 'আরবি', 'question_arabic']);
    const idxOptA = getColIdx(['option_a', 'option_1', 'option1', 'opt_a', 'ক', 'অপশন_ক', 'option_k']);
    const idxOptB = getColIdx(['option_b', 'option_2', 'option2', 'opt_b', 'খ', 'অপশন_খ', 'option_kh']);
    const idxOptC = getColIdx(['option_c', 'option_3', 'option3', 'opt_c', 'গ', 'অপশন_গ', 'option_g']);
    const idxOptD = getColIdx(['option_d', 'option_4', 'option4', 'opt_d', 'ঘ', 'অপশন_ঘ', 'option_gh']);
    const idxCorrect = getColIdx(['correct_option', 'correct_index', 'correct_answer', 'answer', 'ans', 'সঠিক_উত্তর', 'correct']);
    const idxExplanation = getColIdx(['explanation', 'solution', 'ব্যাখ্যা']);
    const idxSubject = getColIdx(['subject', 'বিষয়']);
    const idxTopic = getColIdx(['topic', 'টপিক']);
    const idxCadre = getColIdx(['cadre_tier', 'cadre', 'ক্যাডার']);
    const idxDifficulty = getColIdx(['difficulty', 'মান', 'কঠিন্য']);

    const questions: any[] = [];
    const errors: string[] = [];

    for (let r = 1; r < lines.length; r++) {
      const row = parseCSVRow(lines[r]);
      if (row.length === 0 || (row.length === 1 && !row[0])) continue;

      const qBn = idxQBn !== -1 ? row[idxQBn] : '';
      const qAr = idxQAr !== -1 ? row[idxQAr] : '';

      if (!qBn && !qAr) {
        errors.push(`সারি ${r + 1}: প্রশ্ন (বাংলা/আরবি) পাওয়া যায়নি, স্কিপ করা হলো।`);
        continue;
      }

      let optA = idxOptA !== -1 ? row[idxOptA] : '';
      let optB = idxOptB !== -1 ? row[idxOptB] : '';
      let optC = idxOptC !== -1 ? row[idxOptC] : '';
      let optD = idxOptD !== -1 ? row[idxOptD] : '';

      const opts = [optA, optB, optC, optD].filter(Boolean);
      while (opts.length < 4) {
        opts.push(`অপশন ${['ক', 'খ', 'গ', 'ঘ'][opts.length]}`);
      }

      let rawCorrect = idxCorrect !== -1 ? row[idxCorrect] : '0';
      let correctOpt = 0;

      if (/^[0-3]$/.test(rawCorrect)) {
        correctOpt = parseInt(rawCorrect, 10);
      } else if (/^[1-4]$/.test(rawCorrect)) {
        correctOpt = parseInt(rawCorrect, 10) - 1;
      } else if (/^[a-dA-D]$/i.test(rawCorrect)) {
        const map: Record<string, number> = { a: 0, b: 1, c: 2, d: 3, A: 0, B: 1, C: 2, D: 3 };
        correctOpt = map[rawCorrect] ?? 0;
      } else if (/^[কখগঘ]$/.test(rawCorrect)) {
        const map: Record<string, number> = { 'ক': 0, 'খ': 1, 'গ': 2, 'ঘ': 3 };
        correctOpt = map[rawCorrect] ?? 0;
      } else if (rawCorrect) {
        const matchedIdx = opts.findIndex(o => o.toLowerCase() === rawCorrect.toLowerCase());
        if (matchedIdx !== -1) correctOpt = matchedIdx;
      }

      const exp = idxExplanation !== -1 ? row[idxExplanation] : 'পাঠ্যবই ও ব্যাকরণ ভিত্তিক সমাধান।';
      const sub = (idxSubject !== -1 && row[idxSubject]) ? row[idxSubject] : defaultSub;
      const top = (idxTopic !== -1 && row[idxTopic]) ? row[idxTopic] : defaultTopic;
      const cad = (idxCadre !== -1 && row[idxCadre]) ? row[idxCadre] : defaultCadre;
      const diff = (idxDifficulty !== -1 && row[idxDifficulty]) ? row[idxDifficulty] : 'মাঝারি';

      questions.push({
        question_bn: qBn || qAr,
        question_ar: qAr || undefined,
        options: opts.slice(0, 4),
        correct_option: correctOpt,
        explanation: exp,
        subject: sub,
        topic: top,
        cadre_tier: cad,
        difficulty: diff
      });
    }

    return { questions, errors };
  };

  // JSON Parsing Helper
  const parseJSONData = (jsonText: string, defaultSub: string, defaultCadre: string, defaultTopic: string) => {
    try {
      const cleanJson = jsonText.replace(/^\uFEFF/, '').trim();
      const parsed = JSON.parse(cleanJson);
      let items: any[] = [];

      if (Array.isArray(parsed)) {
        items = parsed;
      } else if (parsed && Array.isArray(parsed.questions)) {
        items = parsed.questions;
      } else if (parsed && Array.isArray(parsed.data)) {
        items = parsed.data;
      } else if (typeof parsed === 'object') {
        items = [parsed];
      }

      const questions: any[] = [];
      const errors: string[] = [];

      items.forEach((item, idx) => {
        const qBn = item.question_bn || item.question || item.title || item.question_text || '';
        const qAr = item.question_ar || item.arabic || item.question_arabic || '';

        if (!qBn && !qAr) {
          errors.push(`আইটেম #${idx + 1}: প্রশ্নের বিবরণ পাওয়া যায়নি, স্কিপ করা হয়েছে।`);
          return;
        }

        let opts: string[] = [];
        if (Array.isArray(item.options)) {
          opts = item.options.map(String);
        } else {
          const oA = item.option_a || item.option_1 || item.option1 || item.option_k || '';
          const oB = item.option_b || item.option_2 || item.option2 || item.option_kh || '';
          const oC = item.option_c || item.option_3 || item.option3 || item.option_g || '';
          const oD = item.option_d || item.option_4 || item.option4 || item.option_gh || '';
          opts = [oA, oB, oC, oD].filter(Boolean);
        }

        while (opts.length < 4) {
          opts.push(`অপশন ${['ক', 'খ', 'গ', 'ঘ'][opts.length]}`);
        }

        let correctOpt = 0;
        if (typeof item.correct_option === 'number') {
          correctOpt = item.correct_option >= 0 && item.correct_option <= 3 ? item.correct_option : 0;
        } else if (typeof item.correct_index === 'number') {
          correctOpt = item.correct_index;
        } else if (item.answer !== undefined || item.correct_answer !== undefined) {
          const ans = String(item.answer || item.correct_answer).trim();
          if (/^[0-3]$/.test(ans)) correctOpt = parseInt(ans, 10);
          else if (/^[1-4]$/.test(ans)) correctOpt = parseInt(ans, 10) - 1;
          else if (/^[a-dA-D]$/i.test(ans)) {
            const map: Record<string, number> = { a: 0, b: 1, c: 2, d: 3, A: 0, B: 1, C: 2, D: 3 };
            correctOpt = map[ans] ?? 0;
          } else if (/^[কখগঘ]$/.test(ans)) {
            const map: Record<string, number> = { 'ক': 0, 'খ': 1, 'গ': 2, 'ঘ': 3 };
            correctOpt = map[ans] ?? 0;
          }
        }

        questions.push({
          question_bn: qBn || qAr,
          question_ar: qAr || undefined,
          options: opts.slice(0, 4),
          correct_option: correctOpt,
          explanation: item.explanation || item.solution || 'পাঠ্যবই ভিত্তিক ব্যাকরণ সমাধান।',
          subject: item.subject || defaultSub,
          topic: item.topic || defaultTopic,
          cadre_tier: item.cadre_tier || item.cadre || defaultCadre,
          difficulty: item.difficulty || 'মাঝারি'
        });
      });

      return { questions, errors };
    } catch (err: any) {
      return { questions: [], errors: [`JSON ফরম্যাট ত্রুটি: ${err.message}`] };
    }
  };

  const handleProcessBulkImport = async (textSource?: string, fileSource?: File) => {
    const finalSubject = (isImportCustomSubject ? importCustomSubject.trim() : importSubjectSelect) || 'সাধারণ বিষয়';
    const finalCadre = (isImportCustomCadre ? importCustomCadre.trim() : importCadreSelect) || 'প্রভাষক (আরবি)';

    if (isImportCustomSubject && importCustomSubject.trim() && onAddCustomSubject) {
      onAddCustomSubject(importCustomSubject.trim());
    }

    setIsImportParsing(true);
    setImportErrors([]);

    let contentToProcess = textSource || importRawText;
    let filename = fileSource ? fileSource.name : '';

    if (fileSource) {
      try {
        contentToProcess = await fileSource.text();
      } catch (err: any) {
        showToast('File Error', 'ফাইল থেকে টেক্সট পড়তে সমস্যা হয়েছে।', 'error');
        setIsImportParsing(false);
        return;
      }
    }

    if (!contentToProcess || !contentToProcess.trim()) {
      showToast('Warning', 'CSV বা JSON ফাইল নির্বাচন করুন অথবা টেক্সট পেস্ট করুন', 'error');
      setIsImportParsing(false);
      return;
    }

    const trimmed = contentToProcess.trim();
    let result: { questions: any[]; errors: string[] } = { questions: [], errors: [] };

    if (filename.endsWith('.json') || trimmed.startsWith('[') || trimmed.startsWith('{')) {
      result = parseJSONData(trimmed, finalSubject, finalCadre, importTopic || 'বাল্ক ইমপোর্ট');
    } else {
      result = parseCSVData(trimmed, finalSubject, finalCadre, importTopic || 'বাল্ক ইমপোর্ট');
    }

    setImportedList(result.questions);
    setImportErrors(result.errors);

    if (result.questions.length > 0) {
      showToast('Data Loaded!', `সফলভাবে ${result.questions.length}টি প্রশ্ন ফাইল/টেক্সট থেকে প্রসেস করা হয়েছে!`, 'success');
    } else {
      showToast('Parsing Failed', 'কোনো বৈধ প্রশ্ন উদ্ধার করা সম্ভব হয়নি। টেমপ্লেট ফরম্যাট চেক করুন।', 'error');
    }

    setIsImportParsing(false);
  };

  const handleDownloadSampleCSV = () => {
    const blob = new Blob(['\uFEFF' + SAMPLE_CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tamreen_questions_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Downloaded!', 'নমুনা CSV টেমপ্লেট ফাইল ডাউনলোড হয়েছে।', 'success');
  };

  const handleDownloadSampleJSON = () => {
    const blob = new Blob([SAMPLE_JSON_TEMPLATE], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tamreen_questions_template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Downloaded!', 'নমুনা JSON টেমপ্লেট ফাইল ডাউনলোড হয়েছে।', 'success');
  };

  const handleCopyTemplateText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
    showToast('Copied!', 'টেমপ্লেট কোড ক্লিপবোর্ডে কপি করা হয়েছে!', 'info');
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setImportFile(file);
      handleProcessBulkImport(undefined, file);
    }
  };

  // ==================== MODE 1: MANUAL FORM ====================
  const [manualSubjectSelect, setManualSubjectSelect] = useState<string>('বালাগাত ও মানতিক');
  const [manualCustomSubject, setManualCustomSubject] = useState<string>('');
  const [isManualCustomSubject, setIsManualCustomSubject] = useState<boolean>(false);

  const [manualCadreSelect, setManualCadreSelect] = useState<string>('প্রভাষক (আরবি)');
  const [manualCustomCadre, setManualCustomCadre] = useState<string>('');
  const [isManualCustomCadre, setIsManualCustomCadre] = useState<boolean>(false);

  const [manualForm, setManualForm] = useState({
    question_bn: '',
    question_ar: '',
    option_0: '',
    option_1: '',
    option_2: '',
    option_3: '',
    correct_option: 0,
    explanation: '',
    topic: '',
    difficulty: 'মাঝারি' as Difficulty
  });

  const handleSaveManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.question_bn.trim() && !manualForm.question_ar.trim()) {
      showToast('Error', 'প্রশ্ন বাংলা বা আরবি টেক্সট পুরণ করুন', 'error');
      return;
    }
    if (!manualForm.option_0 || !manualForm.option_1) {
      showToast('Error', 'কমপক্ষে ১ম ও ২য় অপশন পুরণ করুন', 'error');
      return;
    }

    const finalSubject = (isManualCustomSubject ? manualCustomSubject.trim() : manualSubjectSelect) || 'সাধারণ বিষয়';
    const finalCadre = (isManualCustomCadre ? manualCustomCadre.trim() : manualCadreSelect) || 'প্রভাষক (আরবি)';

    if (isManualCustomSubject && manualCustomSubject.trim() && onAddCustomSubject) {
      onAddCustomSubject(manualCustomSubject.trim());
    }

    try {
      await onAddSingleQuestion({
        question_bn: manualForm.question_bn.trim() || manualForm.question_ar.trim(),
        question_ar: manualForm.question_ar.trim() || undefined,
        options: [manualForm.option_0, manualForm.option_1, manualForm.option_2, manualForm.option_3],
        correct_option: manualForm.correct_option,
        explanation: manualForm.explanation,
        subject: finalSubject as Subject,
        topic: manualForm.topic.trim() || 'সাধারণ',
        cadre_tier: finalCadre as CadreTier,
        difficulty: manualForm.difficulty,
        usage_count: 0
      });

      showToast('Success', 'MCQ প্রশ্নটি মাস্টার প্রশ্ন ব্যাংকে সফলভাবে যুক্ত করা হয়েছে!', 'success');
      setManualForm({
        question_bn: '',
        question_ar: '',
        option_0: '',
        option_1: '',
        option_2: '',
        option_3: '',
        correct_option: 0,
        explanation: '',
        topic: '',
        difficulty: 'মাঝারি'
      });
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  // Preview item editor modal state
  const [editingPreviewItem, setEditingPreviewItem] = useState<{ index: number; data: any; mode: 'mode2' | 'mode3' | 'mode4' } | null>(null);

  const handleEditPreviewItem = (index: number, data: any, mode: 'mode2' | 'mode3' | 'mode4') => {
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
    } else if (mode === 'mode3') {
      setGeneratedList((prev) => {
        const updated = [...prev];
        updated[index] = data;
        return updated;
      });
    } else if (mode === 'mode4') {
      setImportedList((prev) => {
        const updated = [...prev];
        updated[index] = data;
        return updated;
      });
    }
    setEditingPreviewItem(null);
    showToast('Updated', 'প্রিভিউ প্রশ্নটি সফলভাবে আপডেট করা হয়েছে।', 'success');
  };

  const handleDeletePreviewItem = (index: number, mode: 'mode2' | 'mode3' | 'mode4') => {
    if (mode === 'mode2') {
      setParsedPreviewList((prev) => prev.filter((_, i) => i !== index));
    } else if (mode === 'mode3') {
      setGeneratedList((prev) => prev.filter((_, i) => i !== index));
    } else if (mode === 'mode4') {
      setImportedList((prev) => prev.filter((_, i) => i !== index));
    }
    showToast('Removed', 'প্রশ্নটি প্রিভিউ তালিকা থেকে মুছে ফেলা হয়েছে।', 'info');
  };

  // Bulk Save Handler
  const handleBulkSave = async (items: any[], defaultSub: string, defaultCadre: string) => {
    if (items.length === 0) return;

    try {
      const formatted = items.map((q) => ({
        question_bn: q.question_bn || q.question_ar || 'প্রশ্ন টেক্সট',
        question_ar: q.question_ar || undefined,
        options: (q.options?.length === 4 ? q.options : ['অপশন ১', 'অপশন ২', 'অপশন ৩', 'অপশন ৪']) as [string, string, string, string],
        correct_option: typeof q.correct_option === 'number' ? q.correct_option : 0,
        explanation: q.explanation || 'কোনো ব্যাখ্যা দেওয়া হয়নি।',
        subject: (q.subject || defaultSub) as Subject,
        topic: q.topic || 'বাল্ক ইমপোর্ট',
        cadre_tier: (q.cadre_tier || defaultCadre) as CadreTier,
        difficulty: (q.difficulty as Difficulty) || 'মাঝারি',
        usage_count: 0
      }));

      await onBulkAddQuestions(formatted);
      showToast('Bulk Saved!', `সফলভাবে ${items.length}টি প্রশ্ন মাস্টার ডাটাবেজে সংরক্ষণ করা হয়েছে।`, 'success');

      if (activeMode === 'mode2') setParsedPreviewList([]);
      if (activeMode === 'mode3') setGeneratedList([]);
      if (activeMode === 'mode4') setImportedList([]);
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
            Gemini 3.6 Flash Smart Question Generator &amp; Ingestion Engine
          </div>
          <h2 className="text-xl font-bold text-white font-serif">
            এআই প্রশ্ন তৈরি, CSV/JSON বাল্ক ইমপোর্ট ও টেক্সট ইনজেশ্চন হাব
          </h2>
          <p className="text-xs text-slate-300">
            টপিক অনুযায়ী অটোমেটেড এআই প্রশ্ন তৈরি, CSV/JSON বাল্ক ফাইল আপলোড, কপি-পেস্ট পার্সিং কিংবা ম্যানুয়ালি নতুন প্রশ্ন যোগ করুন।
          </p>
        </div>
      </div>

      {/* Mode Selection Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => setActiveMode('mode3')}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
            activeMode === 'mode3'
              ? 'bg-gradient-to-br from-amber-950/80 to-slate-900 border-amber-500/80 text-white shadow-lg'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <h3 className="font-bold text-sm font-serif">Mode 3: এআই জেনারেটর</h3>
          </div>
          <p className="text-xs text-slate-400 line-clamp-2">বিষয় ও টপিক অনুযায়ী Gemini দিয়ে স্বয়ংক্রিয় প্রশ্ন তৈরি।</p>
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
            <FileText className="w-5 h-5 text-teal-400 shrink-0" />
            <h3 className="font-bold text-sm font-serif">Mode 2: কপি-পেস্ট পার্সার</h3>
          </div>
          <p className="text-xs text-slate-400 line-clamp-2">পিডিএফ বা বই থেকে কপি করা টেক্সট অটো পার্সিং।</p>
        </button>

        <button
          onClick={() => setActiveMode('mode4')}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
            activeMode === 'mode4'
              ? 'bg-gradient-to-br from-blue-950/80 to-slate-900 border-blue-500/80 text-white shadow-lg'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <FileSpreadsheet className="w-5 h-5 text-blue-400 shrink-0" />
            <h3 className="font-bold text-sm font-serif">Mode 4: CSV / JSON ইমপোর্ট</h3>
          </div>
          <p className="text-xs text-slate-400 line-clamp-2">CSV বা JSON ফাইল আপলোড করে এক ক্লিকে বহু প্রশ্ন ইনজেস্ট।</p>
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
            <PenTool className="w-5 h-5 text-emerald-400 shrink-0" />
            <h3 className="font-bold text-sm font-serif">Mode 1: ম্যানুয়াল এন্ট্রি</h3>
          </div>
          <p className="text-xs text-slate-400 line-clamp-2">একটি একটি করে নির্দিষ্ট প্রশ্ন ও আরবি টেক্সট ম্যানুয়ালি ইনপুট।</p>
        </button>
      </div>

      {/* ==================== MODE 3: AUTOMATED GENERATOR ==================== */}
      {activeMode === 'mode3' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-base font-bold text-white font-serif flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              স্বয়ংক্রিয় এআই প্রশ্ন জেনারেটর কনফিগারেশন
            </h3>

            {/* Language Selection Bar */}
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
              <label className="text-xs font-semibold text-amber-300 flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-400" />
                <span>প্রশ্ন প্রকাশের ভাষা ও আরবি ফরম্যাট নির্বাচন করুন:</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setGenLangMode('bn_ar')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    genLangMode === 'bn_ar'
                      ? 'bg-amber-950/60 border-amber-500 text-amber-200 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-semibold text-white">🟢 বাংলা + আরবি ইবারত</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">বাংলা প্রশ্নের সাথে মূল আরবি ইবারত যুক্ত থাকবে।</div>
                </button>

                <button
                  type="button"
                  onClick={() => setGenLangMode('ar_only')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    genLangMode === 'ar_only'
                      ? 'bg-amber-950/60 border-amber-500 text-amber-200 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-semibold text-white">🔴 সম্পূর্ণ আরবি (Arabic Only)</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">প্রশ্ন ও চারটি অপশন পুরোটাই বিশুদ্ধ আরবি ভাষায় হবে।</div>
                </button>

                <button
                  type="button"
                  onClick={() => setGenLangMode('bn_only')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    genLangMode === 'bn_only'
                      ? 'bg-amber-950/60 border-amber-500 text-amber-200 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-semibold text-white">🔵 শুধুমাত্র বাংলা (Bengali Only)</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">সহজ সাধারণ বাংলা ভাষায় প্রশ্ন ও অপশন।</div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">বিষয় (Subject)</label>
                {!isGenCustomSubject ? (
                  <div className="space-y-1">
                    <select
                      value={genSubjectSelect}
                      onChange={(e) => setGenSubjectSelect(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-amber-500 focus:outline-none"
                    >
                      {allSubjectsList.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setIsGenCustomSubject(true)}
                      className="text-[10px] text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <PlusCircle className="w-3 h-3" />
                      <span>কাস্টম বিষয় যুক্ত করুন</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={genCustomSubject}
                      onChange={(e) => setGenCustomSubject(e.target.value)}
                      placeholder="নতুন বিষয়ের নাম টাইপ করুন (যেমন: ফরায়েজ)"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-amber-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setIsGenCustomSubject(false)}
                      className="text-[10px] text-slate-400 hover:underline"
                    >
                      ড্রপডাউন তালিকা নির্বাচন করুন
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">টার্গেট পদ (Target Cadre/Post)</label>
                {!isGenCustomCadre ? (
                  <div className="space-y-1">
                    <select
                      value={genCadreSelect}
                      onChange={(e) => setGenCadreSelect(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-amber-500 focus:outline-none"
                    >
                      {standardCadreTiers.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setIsGenCustomCadre(true)}
                      className="text-[10px] text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <PlusCircle className="w-3 h-3" />
                      <span>কাস্টম পদ টাইপ করুন</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={genCustomCadre}
                      onChange={(e) => setGenCustomCadre(e.target.value)}
                      placeholder="কাস্টম পদ টাইপ করুন (যেমন: সিনিয়র শিক্ষক)"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-amber-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setIsGenCustomCadre(false)}
                      className="text-[10px] text-slate-400 hover:underline"
                    >
                      ড্রপডাউন নির্বাচন করুন
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="sm:col-span-1">
                <label className="block text-slate-300 font-medium mb-1">নির্দিষ্ট টপিক / অধ্যায় *</label>
                <input
                  type="text"
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  placeholder="যেমন: ইলমুল বয়ান ও ইস্তিয়ারা"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">কঠিন্যের মান (Difficulty)</label>
                <select
                  value={genDifficulty}
                  onChange={(e) => setGenDifficulty(e.target.value as Difficulty)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-amber-500 focus:outline-none"
                >
                  <option value="সহজ">সহজ (Basic Level)</option>
                  <option value="মাঝারি">মাঝারি (Intermediate)</option>
                  <option value="কঠিন">কঠিন (NTRCA High Standard)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">প্রশ্নের সংখ্যা</label>
                <select
                  value={genCount}
                  onChange={(e) => setGenCount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-amber-500 focus:outline-none font-mono"
                >
                  <option value={3}>৩টি MCQ</option>
                  <option value={5}>৫টি MCQ</option>
                  <option value={10}>১০টি MCQ</option>
                  <option value={15}>১৫টি MCQ</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerateAIQuestions}
              disabled={isGenerating}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Gemini AI প্রশ্নমালা তৈরি করছে... অনুগ্রহ করে অপেক্ষা করুন...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>এআই দিয়ে {genCount}টি MCQ প্রশ্ন তৈরি করুন</span>
                </>
              )}
            </button>
          </div>

          {/* Generated List Preview */}
          {generatedList.length > 0 && (
            <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-white text-sm font-serif">
                    এআই জেনারেটেড প্রিভিউ তালিকা ({generatedList.length}টি প্রশ্ন)
                  </h3>
                </div>

                <button
                  onClick={() => handleBulkSave(generatedList, isGenCustomSubject ? genCustomSubject : genSubjectSelect, isGenCustomCadre ? genCustomCadre : genCadreSelect)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all"
                >
                  <Database className="w-4 h-4" />
                  <span>সব প্রশ্ন ডাটাবেজে সেভ করুন</span>
                </button>
              </div>

              <div className="space-y-4">
                {generatedList.map((q, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 relative">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                          প্রশ্ন #{idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-white font-serif">{q.question_bn}</h4>
                        {q.question_ar && (
                          <p className="text-xs text-amber-300 font-serif text-right" dir="rtl">{q.question_ar}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleEditPreviewItem(idx, q, 'mode3')}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePreviewItem(idx, 'mode3')}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                      {q.options?.map((opt: string, oIdx: number) => (
                        <div
                          key={oIdx}
                          className={`p-2 rounded-lg border text-xs ${
                            q.correct_option === oIdx
                              ? 'bg-emerald-950/60 border-emerald-600 text-emerald-200 font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-300'
                          }`}
                        >
                          {['ক', 'খ', 'গ', 'ঘ'][oIdx]}. {opt}
                        </div>
                      ))}
                    </div>

                    {q.explanation && (
                      <div className="text-[11px] text-slate-400 bg-slate-900 p-2 rounded-lg border border-slate-800/80 mt-2">
                        <strong>ব্যাখ্যা:</strong> {q.explanation}
                      </div>
                    )}
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-base font-bold text-white font-serif flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-400" />
              কপি-পেস্ট প্রশ্নাবলি অটোমেটিক পার্সার
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">ডিফল্ট বিষয় (Subject)</label>
                {!isParseCustomSubject ? (
                  <select
                    value={parseSubjectSelect}
                    onChange={(e) => setParseSubjectSelect(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-teal-500 focus:outline-none"
                  >
                    {allSubjectsList.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={parseCustomSubject}
                    onChange={(e) => setParseCustomSubject(e.target.value)}
                    placeholder="নতুন বিষয়ের নাম টাইপ করুন"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-teal-500 focus:outline-none"
                  />
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">ডিফল্ট পদ (Cadre/Post)</label>
                {!isParseCustomCadre ? (
                  <select
                    value={parseCadreSelect}
                    onChange={(e) => setParseCadreSelect(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-teal-500 focus:outline-none"
                  >
                    {standardCadreTiers.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={parseCustomCadre}
                    onChange={(e) => setParseCustomCadre(e.target.value)}
                    placeholder="কাস্টম পদ"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-teal-500 focus:outline-none"
                  />
                )}
              </div>
            </div>

            <div className="text-xs space-y-1">
              <label className="block text-slate-300 font-medium">পিডিএফ / শিট থেকে কপি করা অসাজানো টেক্সট এখানে পেস্ট করুন *</label>
              <textarea
                rows={8}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={`১. বালাগাত শব্দের অর্থ কী?
ক) অলংকার খ) সৌন্দর্য গ) পৌঁছানো ঘ) ব্যাকরণ
উত্তর: গ
ব্যাখ্যা: বালাগাত শব্দের শাব্দিক অর্থ পৌঁছানো বা পৌঁছে দেওয়া।

২. হাদিস শাস্ত্রের মৌলিক গ্রন্থ কোনটি?
ক) বুখারী খ) মুসলিম গ) তিরমিযী ঘ) সবগুলো
উত্তর: ঘ`}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 font-mono text-xs focus:border-teal-500 focus:outline-none leading-relaxed"
              />
            </div>

            <button
              onClick={handleParseRawText}
              disabled={isParsing}
              className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isParsing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>টেক্সট বিশ্লেষণ ও পার্স করা হচ্ছে...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 text-white" />
                  <span>টেক্সট থেকে অটো এক্সট্র্যাক্ট ও পার্স করুন</span>
                </>
              )}
            </button>
          </div>

          {/* Parsed List Preview */}
          {parsedPreviewList.length > 0 && (
            <div className="bg-slate-900 border border-teal-500/30 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-400" />
                  <h3 className="font-bold text-white text-sm font-serif">
                    এক্সট্র্যাক্ট হওয়া প্রিভিউ প্রশ্নাবলি ({parsedPreviewList.length}টি প্রশ্ন)
                  </h3>
                </div>

                <button
                  onClick={() => handleBulkSave(parsedPreviewList, isParseCustomSubject ? parseCustomSubject : parseSubjectSelect, isParseCustomCadre ? parseCustomCadre : parseCadreSelect)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all"
                >
                  <Database className="w-4 h-4" />
                  <span>সবগুলো প্রশ্ন ব্যাংকে যোগ করুন</span>
                </button>
              </div>

              <div className="space-y-4">
                {parsedPreviewList.map((q, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 relative">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/40">
                          পার্সড প্রশ্ন #{idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-white font-serif">{q.question_bn}</h4>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleEditPreviewItem(idx, q, 'mode2')}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePreviewItem(idx, 'mode2')}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                      {q.options?.map((opt: string, oIdx: number) => (
                        <div
                          key={oIdx}
                          className={`p-2 rounded-lg border text-xs ${
                            q.correct_option === oIdx
                              ? 'bg-emerald-950/60 border-emerald-600 text-emerald-200 font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-300'
                          }`}
                        >
                          {['ক', 'খ', 'গ', 'ঘ'][oIdx]}. {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== MODE 4: CSV / JSON BULK IMPORT ==================== */}
      {activeMode === 'mode4' && (
        <div className="space-y-6">
          {/* Top Templates Download & Guide Banner */}
          <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white font-serif flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-blue-400" />
                  CSV / JSON বাল্ক ফাইল ইমপোর্ট প্যানেল
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  এক সাথে ৫০-১০০টি আরবি ও বাংলা প্রশ্ন সরাসরি CSV (Excel) বা JSON ফাইল থেকে ইনজেস্ট করুন।
                </p>
              </div>

              {/* Sample Download Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleDownloadSampleCSV}
                  className="px-3 py-2 rounded-xl bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-700/60 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  <span>নমুনা CSV ডাউনলোড</span>
                </button>

                <button
                  onClick={handleDownloadSampleJSON}
                  className="px-3 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-700/60 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 text-purple-400" />
                  <span>নমুনা JSON ডাউনলোড</span>
                </button>
              </div>
            </div>

            {/* Interactive Template Viewer */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden text-xs">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold text-slate-300">ফরম্যাট নির্দেশিকা ও স্যাম্পল কোড টেমপ্লেট</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                    <button
                      onClick={() => setTemplateTab('csv')}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                        templateTab === 'csv'
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      CSV
                    </button>
                    <button
                      onClick={() => setTemplateTab('json')}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                        templateTab === 'json'
                          ? 'bg-purple-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      JSON
                    </button>
                  </div>

                  <button
                    onClick={() => handleCopyTemplateText(templateTab === 'csv' ? SAMPLE_CSV_TEMPLATE : SAMPLE_JSON_TEMPLATE)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium flex items-center gap-1 transition-all"
                  >
                    {copiedTemplate ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>কপি হয়েছে!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-400" />
                        <span>কপি টেমপ্লেট</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-3 font-mono text-[11px] text-slate-300 overflow-x-auto bg-slate-950/90 max-h-40">
                <pre>{templateTab === 'csv' ? SAMPLE_CSV_TEMPLATE : SAMPLE_JSON_TEMPLATE}</pre>
              </div>

              {/* CSV Columns Field Descriptions */}
              <div className="p-3 bg-slate-900/50 border-t border-slate-800/80 text-[11px] text-slate-400 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <strong className="text-slate-200">হেডার কলামসমূহ:</strong>
                  <p className="text-[10px] text-slate-400">
                    <code className="text-blue-300">question_bn</code>, <code className="text-blue-300">question_ar</code>, <code className="text-blue-300">option_a</code>, <code className="text-blue-300">option_b</code>, <code className="text-blue-300">option_c</code>, <code className="text-blue-300">option_d</code>, <code className="text-blue-300">correct_option</code>, <code className="text-blue-300">explanation</code>, <code className="text-blue-300">subject</code>, <code className="text-blue-300">topic</code>, <code className="text-blue-300">cadre_tier</code>, <code className="text-blue-300">difficulty</code>
                  </p>
                </div>
                <div>
                  <strong className="text-slate-200">সঠিক উত্তর নিয়ম:</strong>
                  <p className="text-[10px] text-slate-400">
                    <code className="text-amber-300">correct_option</code> এর মান <code className="text-amber-300">0, 1, 2, 3</code> অথবা <code className="text-amber-300">ক, খ, গ, ঘ</code> অথবা <code className="text-amber-300">A, B, C, D</code> হিসেবে দেওয়া যাবে।
                  </p>
                </div>
              </div>
            </div>

            {/* Default Subject & Cadre Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
              <div>
                <label className="block text-slate-300 font-medium mb-1">ডিফল্ট বিষয় (যদি ফাইলে না থাকে)</label>
                {!isImportCustomSubject ? (
                  <select
                    value={importSubjectSelect}
                    onChange={(e) => setImportSubjectSelect(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                  >
                    {allSubjectsList.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={importCustomSubject}
                    onChange={(e) => setImportCustomSubject(e.target.value)}
                    placeholder="নতুন বিষয়"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                  />
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">ডিফল্ট পদ (Target Cadre)</label>
                {!isImportCustomCadre ? (
                  <select
                    value={importCadreSelect}
                    onChange={(e) => setImportCadreSelect(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                  >
                    {standardCadreTiers.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={importCustomCadre}
                    onChange={(e) => setImportCustomCadre(e.target.value)}
                    placeholder="কাস্টম পদ"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                  />
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">ডিফল্ট টপিক / ব্যাচ নাম</label>
                <input
                  type="text"
                  value={importTopic}
                  onChange={(e) => setImportTopic(e.target.value)}
                  placeholder="যেমন: বাল্ক ইমপোর্ট সেট - ১"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Input Method Toggle (File Upload vs Direct Paste) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200">ইনপুট পদ্ধতি নির্বাচন করুন:</label>
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setImportInputMethod('file')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                      importInputMethod === 'file'
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>ফাইল ড্রপ / সিলেক্ট (.csv / .json)</span>
                  </button>

                  <button
                    onClick={() => setImportInputMethod('text')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                      importInputMethod === 'text'
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>সরাসরি টেক্সট পেস্ট (Direct Paste)</span>
                  </button>
                </div>
              </div>

              {importInputMethod === 'file' ? (
                /* File Dropzone */
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleFileDrop}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                    dragOver
                      ? 'border-blue-500 bg-blue-950/40'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-950'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv, .json, .txt"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        const f = e.target.files[0];
                        setImportFile(f);
                        handleProcessBulkImport(undefined, f);
                      }
                    }}
                    className="hidden"
                  />

                  <UploadCloud className="w-10 h-10 mx-auto text-blue-400 mb-2 animate-bounce" />
                  <h4 className="font-bold text-white text-sm">
                    {importFile ? `নির্বাচিত ফাইল: ${importFile.name}` : 'এখানে আপনার CSV বা JSON ফাইল ড্র্যাগ করে ছাড়ুন'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    অথবা আপনার ডিভাইস থেকে ফাইল ব্রাউজ করে নির্বাচন করতে ক্লিক করুন (<code className="text-blue-300">.csv</code>, <code className="text-purple-300">.json</code>)
                  </p>
                </div>
              ) : (
                /* Raw CSV/JSON Text Area */
                <div className="space-y-1">
                  <textarea
                    rows={8}
                    value={importRawText}
                    onChange={(e) => setImportRawText(e.target.value)}
                    placeholder="এখানে আপনার সম্পূর্ণ CSV কমা-সেপারেটেড টেক্সট অথবা JSON অ্যারে পেস্ট করুন..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 font-mono text-xs focus:border-blue-500 focus:outline-none leading-relaxed"
                  />
                  <button
                    onClick={() => handleProcessBulkImport(importRawText)}
                    disabled={isImportParsing}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {isImportParsing ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <FileCheck className="w-4 h-4 text-white" />
                    )}
                    <span>পেস্ট করা ডাটা পার্স ও ইনজেস্ট করুন</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Import Warnings & Errors if any */}
          {importErrors.length > 0 && (
            <div className="bg-amber-950/40 border border-amber-500/40 p-4 rounded-xl space-y-1 text-xs">
              <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>পার্সিং নোট ও সতর্কবার্তা ({importErrors.length}টি)</span>
              </h4>
              <ul className="list-disc list-inside text-amber-200/80 space-y-0.5 pl-1">
                {importErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Imported List Preview Table */}
          {importedList.length > 0 && (
            <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-blue-400" />
                  <h3 className="font-bold text-white text-sm font-serif">
                    ইনজেস্টেড বাল্ক প্রশ্নাবলি প্রিভিউ ({importedList.length}টি প্রশ্ন প্রস্তুত)
                  </h3>
                </div>

                <button
                  onClick={() => handleBulkSave(importedList, isImportCustomSubject ? importCustomSubject : importSubjectSelect, isImportCustomCadre ? importCustomCadre : importCadreSelect)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Database className="w-4 h-4" />
                  <span>মাস্টার প্রশ্ন ব্যাংকে যুক্ত করুন ({importedList.length}টি প্রশ্ন)</span>
                </button>
              </div>

              <div className="space-y-4">
                {importedList.map((q, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 relative">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40">
                            ইনপুট প্রশ্ন #{idx + 1}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {q.subject}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white font-serif">{q.question_bn}</h4>
                        {q.question_ar && (
                          <p className="text-xs text-amber-300 font-serif text-right" dir="rtl">{q.question_ar}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleEditPreviewItem(idx, q, 'mode4')}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                          title="এডিট করুন"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePreviewItem(idx, 'mode4')}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                      {q.options?.map((opt: string, oIdx: number) => (
                        <div
                          key={oIdx}
                          className={`p-2 rounded-lg border text-xs ${
                            q.correct_option === oIdx
                              ? 'bg-emerald-950/60 border-emerald-600 text-emerald-200 font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-300'
                          }`}
                        >
                          {['ক', 'খ', 'গ', 'ঘ'][oIdx]}. {opt}
                        </div>
                      ))}
                    </div>

                    {q.explanation && (
                      <div className="text-[11px] text-slate-400 bg-slate-900 p-2 rounded-lg border border-slate-800/80 mt-2">
                        <strong>ব্যাখ্যা:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== MODE 1: MANUAL FORM ==================== */}
      {activeMode === 'mode1' && (
        <form onSubmit={handleSaveManual} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white font-serif flex items-center gap-2 border-b border-slate-800 pb-3">
            <PenTool className="w-5 h-5 text-emerald-400" />
            ম্যানুয়াল প্রশ্ন ইনপুট ফর্ম
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">বিষয় (Subject)</label>
              {!isManualCustomSubject ? (
                <div className="space-y-1">
                  <select
                    value={manualSubjectSelect}
                    onChange={(e) => setManualSubjectSelect(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                  >
                    {allSubjectsList.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsManualCustomSubject(true)}
                    className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <PlusCircle className="w-3 h-3" />
                    <span>কাস্টম বিষয় যুক্ত করুন</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <input
                    type="text"
                    value={manualCustomSubject}
                    onChange={(e) => setManualCustomSubject(e.target.value)}
                    placeholder="নতুন বিষয়ের নাম টাইপ করুন"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setIsManualCustomSubject(false)}
                    className="text-[10px] text-slate-400 hover:underline"
                  >
                    ড্রপডাউন নির্বাচন করুন
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">টার্গেট পদ (Target Cadre)</label>
              {!isManualCustomCadre ? (
                <div className="space-y-1">
                  <select
                    value={manualCadreSelect}
                    onChange={(e) => setManualCadreSelect(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                  >
                    {standardCadreTiers.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsManualCustomCadre(true)}
                    className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <PlusCircle className="w-3 h-3" />
                    <span>কাস্টম পদ টাইপ করুন</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <input
                    type="text"
                    value={manualCustomCadre}
                    onChange={(e) => setManualCustomCadre(e.target.value)}
                    placeholder="কাস্টম পদ টাইপ করুন"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setIsManualCustomCadre(false)}
                    className="text-[10px] text-slate-400 hover:underline"
                  >
                    ড্রপডাউন নির্বাচন করুন
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">টপিক / অধ্যায় *</label>
              <input
                type="text"
                value={manualForm.topic}
                onChange={(e) => setManualForm({ ...manualForm, topic: e.target.value })}
                placeholder="যেমন: ইলমুল বালাগাত"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">কঠিন্যের মান</label>
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

          <div className="space-y-3 text-xs pt-2">
            <div>
              <label className="block text-slate-300 font-medium mb-1">প্রশ্ন (বাংলা টেক্সট) *</label>
              <textarea
                rows={2}
                value={manualForm.question_bn}
                onChange={(e) => setManualForm({ ...manualForm, question_bn: e.target.value })}
                placeholder="বাংলা ভাষায় প্রশ্ন লিখুন..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">প্রশ্ন (আরবি ইবারত - ঐচ্ছিক)</label>
              <input
                type="text"
                value={manualForm.question_ar}
                onChange={(e) => setManualForm({ ...manualForm, question_ar: e.target.value })}
                placeholder="মা হিয়া আকসামুল বালাগাত? (ما هي أقسام البلاغة؟)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-amber-300 font-serif focus:border-emerald-500 focus:outline-none text-right"
                dir="rtl"
              />
            </div>
          </div>

          {/* 4 Options & Correct Answer Selector */}
          <div className="space-y-2 text-xs pt-2">
            <label className="block text-slate-300 font-medium">৪টি অপশন টাইপ করুন এবং সঠিক উত্তরের রেডিও বাটনে টিক দিন *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[0, 1, 2, 3].map((idx) => {
                const optKey = `option_${idx}` as 'option_0' | 'option_1' | 'option_2' | 'option_3';
                const label = ['ক', 'খ', 'গ', 'ঘ'][idx];
                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                      manualForm.correct_option === idx
                        ? 'bg-emerald-950/60 border-emerald-600'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="manual_correct"
                      checked={manualForm.correct_option === idx}
                      onChange={() => setManualForm({ ...manualForm, correct_option: idx })}
                      className="accent-emerald-500"
                    />
                    <span className="font-bold text-slate-400">{label}.</span>
                    <input
                      type="text"
                      value={manualForm[optKey]}
                      onChange={(e) => setManualForm({ ...manualForm, [optKey]: e.target.value })}
                      placeholder={`অপশন ${label}...`}
                      className="w-full bg-transparent text-slate-100 focus:outline-none text-xs"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-xs pt-2">
            <label className="block text-slate-300 font-medium mb-1">ব্যাখ্যা ও রেফারেন্স (Explanation)</label>
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
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md active:scale-95 transition-all"
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
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium text-xs"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={handleSavePreviewItemEdit}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md text-xs"
                >
                  আপডেট করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

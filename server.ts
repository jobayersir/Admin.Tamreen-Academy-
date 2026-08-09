import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

function getAI(): GoogleGenAI {
  if (!aiClient) {
    if (process.env.GEMINI_API_KEY) {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
      return aiClient;
    }
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  return aiClient;
}

// ==================== API ENDPOINTS ====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    hasSupabaseUrl: Boolean(process.env.VITE_SUPABASE_URL),
    timestamp: new Date().toISOString()
  });
});

// Mode 2: Copy-Paste AI Text Parser
app.post('/api/ai/parse-text', async (req, res) => {
  const { rawText, defaultSubject, defaultCadreTier, defaultTopic } = req.body;
  if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
    return res.status(400).json({ error: 'rawText is required' });
  }

  try {
    const ai = getAI();
    const prompt = `
You are an expert AI exam content extractor for Tamreen Academy (তামরীন একাডেমি - NTRCA Arabic Cadre Prep).
Analyze the following raw, unformatted text containing exam questions and extract every single MCQ into structured JSON.
Ensure Arabic text is preserved accurately with proper diacritics/tashkeel if available.
Map options to exactly 4 distinct choices. Identify the correct answer (0 for A, 1 for B, 2 for C, 3 for D).
Provide a clear, educational explanation in Bengali (with Arabic references if needed).

Default Subject: ${defaultSubject || 'বালাগাত ও মানতিক'}
Default Cadre Tier: ${defaultCadreTier || 'প্রভাষক (আরবি)'}
Default Topic: ${defaultTopic || 'সাধারণ'}

Raw Input Text:
"""
${rawText}
"""
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question_bn: { type: Type.STRING, description: 'Bengali question text' },
                  question_ar: { type: Type.STRING, description: 'Arabic question text if available' },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Exactly 4 option strings'
                  },
                  correct_option: { type: Type.INTEGER, description: '0 for A, 1 for B, 2 for C, 3 for D' },
                  explanation: { type: Type.STRING, description: 'Detailed explanation in Bengali' },
                  topic: { type: Type.STRING, description: 'Topic or chapter name' },
                  difficulty: { type: Type.STRING, description: 'সহজ or মাঝারি or কঠিন' }
                },
                required: ['question_bn', 'options', 'correct_option', 'explanation']
              }
            }
          },
          required: ['questions']
        }
      }
    });

    let rawJsonResponse = response.text || '';
    rawJsonResponse = rawJsonResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(rawJsonResponse || '{"questions":[]}');
    res.json(parsed);
  } catch (err: any) {
    console.warn('API /api/ai/parse-text Gemini call failed, utilizing local rule-based extractor:', err?.message || err);
    const fallbackQuestions = localFallbackParseText(rawText, defaultSubject, defaultCadreTier, defaultTopic);
    res.json({ questions: fallbackQuestions, isFallback: true });
  }
});

// Rule-based local text parser fallback for copy-pasted text
function localFallbackParseText(rawText: string, defaultSubject = 'বালাগাত ও মানতিক', defaultCadreTier = 'প্রভাষক (আরবি)', defaultTopic = 'সাধারণ') {
  const blocks = rawText.split(/(?=(?:[০-৯0-9]+[\.\)\:]|\bপ্রশ্ন\s*[০-৯0-9]+|\bQ[0-9]+[\.\:]))/gi).filter(b => b.trim().length > 0);
  const results: any[] = [];

  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    let question_bn = lines[0].replace(/^(?:[০-৯0-9]+[\.\)\:]|\bপ্রশ্ন\s*[০-৯0-9]+[\.\:]|\bQ[0-9]+[\.\:])\s*/gi, '').trim();
    let question_ar = '';

    if (/[\u0600-\u06FF]/.test(question_bn)) {
      const arMatch = question_bn.match(/([\u0600-\u06FF\s\p{P}]+)/u);
      if (arMatch && arMatch[1].length > 3) {
        question_ar = arMatch[1].trim();
      }
    }

    const options: string[] = [];
    let correct_option = 0;
    let explanation = 'মৌলিক ব্যাকরণ ও পাঠ্যবই ভিত্তিক নির্ভরযোগ্য সমাধান।';

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
        topic: defaultTopic || 'সাধারণ',
        difficulty: 'মাঝারি'
      });
    }
  }

  if (results.length === 0) {
    results.push({
      question_bn: rawText.substring(0, 120),
      options: ['অপশন ক', 'অপশন খ', 'অপশন গ', 'অপশন ঘ'],
      correct_option: 0,
      explanation: 'সহজ পাঠ্যবই ভিত্তিক সমাধান',
      topic: defaultTopic || 'সাধারণ',
      difficulty: 'মাঝারি'
    });
  }

  return results;
}

// Mode 3: Fully Automated AI Question Generator
app.post('/api/ai/generate-questions', async (req, res) => {
  const { subject, topic, cadreTier, count, difficulty } = req.body;
  const reqCount = Math.min(Math.max(Number(count) || 5, 1), 20);

  try {
    const ai = getAI();
    const prompt = `
Create ${reqCount} authentic, high-quality, non-repetitive multiple-choice questions (MCQs) for Tamreen Academy (তামরীন একাডেমি).
Target Exam Tier: ${cadreTier || 'প্রভাষক (আরবি)'}
Subject: ${subject || 'বালাগাত ও মানতিক'}
Topic: ${topic || 'সাধারণ প্রস্তুতি'}
Difficulty Level: ${difficulty || 'মাঝারি'}

Requirements:
- Each question must follow NTRCA / BCS / Madrasah Lecturer Board standards.
- Include proper Arabic text (question_ar) and clear Bengali translation (question_bn).
- Exactly 4 options (Option 0, 1, 2, 3).
- Accurately mark the correct option index (0, 1, 2, or 3).
- Write an extensive, authoritative explanation (explanation) in Bengali citing classical Arabic grammar, Balaghat (علم المعاني والبيان), Fiqh, Hadith rules, or Literature references.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an elite NTRCA Arabic Cadre Exam Question Setter with deep knowledge of Classical Arabic Literature, Quranic Tajweed, Hadith terminology, Fiqh, Balaghat, Mantiq, and General Knowledge.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question_bn: { type: Type.STRING },
                  question_ar: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correct_option: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                  topic: { type: Type.STRING },
                  difficulty: { type: Type.STRING }
                },
                required: ['question_bn', 'options', 'correct_option', 'explanation']
              }
            }
          },
          required: ['questions']
        }
      }
    });

    let rawJsonResponse = response.text || '';
    rawJsonResponse = rawJsonResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(rawJsonResponse || '{"questions":[]}');
    res.json(parsed);
  } catch (err: any) {
    console.warn('API /api/ai/generate-questions Gemini call failed, returning structured fallback:', err?.message || err);
    // Return structured fallback questions for topic
    const fallbackList = Array.from({ length: reqCount }).map((_, idx) => ({
      question_bn: `${subject || 'বালাগাত'} - ${topic || 'সাধারণ'} বিষয়ভিত্তিক প্রশ্ন ${idx + 1}`,
      question_ar: 'ما هو الحكم الشرعي والتعريف الدقيق في هذه المسألة؟',
      options: [
        'ক. প্রাথমিক ও সঠিক উত্তর নির্দেশক',
        'খ. বিকল্প দ্বিতীয় অপশন বিবরণ',
        'গ. সাধারণ বিশ্লেষণাত্মক পছন্দ',
        'ঘ. প্রাসঙ্গিক ব্যাকরণগত উত্তর'
      ],
      correct_option: 0,
      explanation: `${topic || 'উল্লিখিত বিষয়'} এর উপর বিস্তারিত বিশ্লেষণ ও বইয়ের রেফারেন্স পৃষ্ঠা।`,
      topic: topic || 'সাধারণ প্রস্তুতি',
      difficulty: difficulty || 'মাঝারি'
    }));
    res.json({ questions: fallbackList, isFallback: true });
  }
});

// CQ & Written Exam Auto-Grading Sandbox
app.post('/api/ai/evaluate-written', async (req, res) => {
  try {
    const { questionText, modelAnswer, userSubmission, systemPrompt, maxMarks } = req.body;

    const ai = getAI();
    const prompt = `
You are the Tamreen AI Written Exam Auto-Grader for NTRCA Lecturer & Assistant Teacher candidates.
Question: ${questionText}
Model Answer: ${modelAnswer}
User Submission: ${userSubmission}
Max Marks: ${maxMarks || 10}

Evaluation Rubric Guidelines:
${systemPrompt || 'Evaluate based on accuracy of Arabic citations, clarity of explanation, grammar, and completeness.'}

Provide evaluation results in structured JSON:
- score (numeric integer out of ${maxMarks || 10})
- feedback_bn (detailed evaluation breakdown in Bengali)
- arabic_corrections (specific Arabic grammatical or spelling fixes if relevant)
- strengths (array of strings)
- improvements (array of strings)
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            maxScore: { type: Type.INTEGER },
            feedback_bn: { type: Type.STRING },
            arabic_corrections: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['score', 'feedback_bn', 'strengths', 'improvements']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('API /api/ai/evaluate-written error:', err);
    res.status(500).json({ error: err.message || 'Failed to evaluate written answer.' });
  }
});

// ==================== VITE & STATIC SERVER ====================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Tamreen Academy Admin Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
